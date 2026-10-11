import os
import base64
import requests

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    static_folder=BASE_DIR,
    static_url_path=""
)

CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MURF_API_KEY = os.getenv("MURF_API_KEY")

# Initialize Gemini only when the API key is available.
client = (
    genai.Client(api_key=GEMINI_API_KEY)
    if GEMINI_API_KEY
    else None
)

PROMPTS = {
    "Summary": """
You are an Indian cultural storyteller.
Explain the topic "{topic}" in {language}.
Include its cultural significance and interesting facts.
Keep the story concise, engaging, and under 2000 characters.
Distinguish legends from verified historical facts.
Respond only in {language}.
""",
    "Detailed": """
You are an Indian cultural storyteller.
Explain "{topic}" in {language} in detail.
Include historical background, cultural significance,
traditions, interesting facts and relevant examples.
Keep the story under 3700 characters.
Distinguish legends from verified historical facts.
Respond only in {language}.
"""
}

VOICES = {
    "English": {"Male": "Matthew", "Female": "Alicia"},
    "Hindi": {"Male": "Aman", "Female": "Namrita"},
    "Tamil": {"Male": "Murali", "Female": "Iniya"},
    "Telugu": {"Male": "Zion", "Female": "Josie"}
}

LOCALES = {
    "English": "en-US",
    "Hindi": "hi-IN",
    "Tamil": "ta-IN",
    "Telugu": "te-IN"
}


def generate_story(topic, story_type, language):
    if not client:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    prompt = PROMPTS[story_type].format(
        topic=topic,
        language=language
    )

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    story = response.text.strip()

    # Keep the story within Murf's request limit.
    if len(story) > 2900:
        shortened = story[:2900]
        last_space = shortened.rfind(" ")

        if last_space > 0:
            shortened = shortened[:last_space]

        story = shortened.rstrip()

        last_sentence = max(
            story.rfind("."),
            story.rfind("!"),
            story.rfind("?")
        )

        if last_sentence > len(story) // 2:
            story = story[:last_sentence + 1]

    return story


def generate_speech(text, voice_id, locale):
    if not MURF_API_KEY:
        raise RuntimeError("MURF_API_KEY is not configured.")

    if len(text) > 2900:
        raise ValueError(
            f"Story is too long for Murf: {len(text)} characters."
        )

    url = "https://global.api.murf.ai/v1/speech/stream"

    headers = {
        "api-key": MURF_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "voice_id": voice_id,
        "text": text,
        "locale": locale,
        "model": "FALCON",
        "format": "MP3",
        "sampleRate": 24000,
        "channelType": "MONO"
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=120
    )

    if response.status_code != 200:
        app.logger.error(
            "Murf API returned status %s: %s",
            response.status_code,
            response.text
        )
        raise RuntimeError(
            f"Murf API returned status {response.status_code}."
        )

    return base64.b64encode(response.content).decode("utf-8")


@app.route("/", methods=["GET"])
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/generate-story", methods=["POST"])
def generate_story_api():
    data = request.get_json(silent=True) or {}

    topic = data.get("topic", "")
    story_type = data.get("storyType", "Summary")
    language = data.get("language", "English")
    voice = data.get("voice", "Male")

    if not isinstance(topic, str) or not topic.strip():
        return jsonify({
            "error": "Enter a story topic."
        }), 400

    topic = topic.strip()

    if story_type not in PROMPTS:
        return jsonify({
            "error": "Invalid story type."
        }), 400

    if language not in VOICES or voice not in VOICES[language]:
        return jsonify({
            "error": "Invalid language or voice."
        }), 400

    if not GEMINI_API_KEY or not MURF_API_KEY:
        app.logger.error("Required API keys are not configured.")
        return jsonify({
            "error": "The service is not configured. Please try again later."
        }), 503

    try:
        story = generate_story(
            topic,
            story_type,
            language
        )

        audio = generate_speech(
            story,
            VOICES[language][voice],
            LOCALES[language]
        )

        return jsonify({
            "story": story,
            "audioBase64": audio
        }), 200

    except Exception:
        app.logger.exception("Story generation failed")
        return jsonify({
            "error": "Story generation failed. Please try again later."
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
