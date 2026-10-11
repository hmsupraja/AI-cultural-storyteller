# Cultural Storyteller

An AI-powered web application that creates cultural stories from user-provided topics and turns them into spoken audio. The project combines a Flask backend, Google Gemini for story generation, and Murf AI for text-to-speech, with a responsive HTML, CSS, and JavaScript frontend.

## Features

- **AI Story Generation:** Create a cultural story from a topic such as a festival, folk tale, historical event, or regional tradition.
- **Story Modes:** Choose between Summary and Detailed story formats.
- **Multiple Languages:** Generate stories in English, Hindi, Tamil, or Telugu, depending on the languages configured in the application.
- **Text-to-Speech:** Convert the generated story into audio using Murf AI.
- **Audio Controls:** Play the generated audio and download it as an MP3 file.
- **Story Transcript:** Read the generated story alongside the audio.
- **Topic Gallery:** Select example topics and filter them by category.
- **Favorites:** Save stories in the browser and revisit them later.
- **Input Validation:** Reject empty topics and unsupported story types, languages, or voices.
- **Automated Tests:** Unit tests cover the home endpoint, input validation, and successful story-generation response handling.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| AI Story Generation | Google Gemini API (`google-genai`) |
| Text-to-Speech | Murf AI API |
| Configuration | Environment variables, `python-dotenv` |
| Testing | Python `unittest`, Flask test client, `unittest.mock` |

## Project Structure

```text
AI-cultural-storyteller/
├── app.py              # Flask application and API endpoint
├── index.html          # Main web page
├── style.css           # Styling and responsive layout
├── index.js            # Frontend interactions and API requests
├── test_app.py         # Backend unit tests
├── requirements.txt    # Python dependencies
├── .env                # Local API keys (do not commit)
├── .gitignore          # Files excluded from Git
└── .venv/              # Local Python virtual environment (do not commit)
```

Your local project may contain additional files or folders. Keep the structure consistent with the paths referenced in `app.py` and `index.html`.

## Prerequisites

- Python 3.10 or a compatible version supported by your installed dependencies
- A Google Gemini API key
- A Murf AI API key
- A modern web browser
- Visual Studio Code or another code editor

## Installation and Setup

### 1. Open the Project Directory

Open the `cultural-storyteller` folder in VS Code and start a terminal in that directory.

### 2. Create and Activate a Virtual Environment

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use the Python executable inside `.venv` directly or use a terminal with an appropriate activation policy.

### 3. Install Dependencies

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If you do not yet have a `requirements.txt`, install the packages required by your implementation. These may include Flask, Flask-CORS, `google-genai`, `requests`, and `python-dotenv`.

### 4. Configure API Keys

Create a file named `.env` in the project root:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
MURF_API_KEY=your_murf_api_key_here
```

Replace the placeholder values with your own valid API keys. The variable names must match those read by your `app.py`.

**Security warning:** Never publish actual API keys, access tokens, or credentials in your source code, screenshots, or GitHub repository.

### 5. Start the Flask Backend

Run:

```powershell
python app.py
```

Use the local address printed in your terminal. The current project setup is expected to use:

```text
http://127.0.0.1:5000
```

Keep the terminal running while using the frontend.

### 6. Open the Frontend

Open `index.html` in your browser or use the local frontend-serving method configured for your project.

The JavaScript frontend sends requests to the Flask backend at:

```text
http://127.0.0.1:5000/generate-story
```

If your backend uses a different host or port, update the API URL in `index.js` to match.

## How to Use the Application

1. Open the Cultural Storyteller web page.
2. Select a topic from the gallery or enter a topic manually.
3. Choose a story mode: Summary or Detailed.
4. Select a supported language and voice.
5. Click the button to generate the story.
6. Read the generated story in the transcript section.
7. Play the generated audio.
8. Download the audio if needed.
9. Save the story to Favorites to revisit it later.
10. Open Favorites to view saved stories or remove them when no longer needed.

## API Reference

### `GET /`

Returns the application's home page when the Flask app is configured to serve it at this route.

### `POST /generate-story`

Generates a story and its audio.

**Example request body:**

```json
{
  "topic": "Diwali",
  "storyType": "Summary",
  "language": "English",
  "voice": "Male"
}
```

**Expected successful response fields:**

```json
{
  "story": "Generated story text...",
  "audioBase64": "Base64-encoded audio data..."
}
```

The exact response may include additional fields depending on the implementation in `app.py`. The frontend uses the `story` and `audioBase64` fields.

### Input Validation

The backend is expected to reject the following invalid inputs with HTTP `400 Bad Request`:

- An empty topic
- An unsupported story type
- An unsupported language
- An unsupported voice

The example values above reflect the project's unit tests. Keep the documented values aligned with the validation rules in `app.py`.

## Running the Tests

The project includes backend tests in `test_app.py`.

From the project root, activate the virtual environment and run:

```powershell
python -m unittest test_app -v
```

The tests cover:

1. The home endpoint returns HTTP 200.
2. An empty topic returns HTTP 400.
3. An unsupported story type returns HTTP 400.
4. An unsupported language returns HTTP 400.
5. An unsupported voice returns HTTP 400.
6. Successful story generation returns HTTP 200 and the expected `story` and `audioBase64` fields.

The successful-generation test mocks the story and speech functions, so it does not require live Gemini or Murf API calls. Its mock audio value is only a test placeholder and is not playable audio.

## Favorites and Browser Storage

Favorites are stored in the browser's `localStorage` under the key:

```text
culturalStorytellerFavorites
```

Saved favorites persist across page refreshes in the same browser profile. They are not currently stored in a server-side database, and the generated MP3 audio is not saved as part of each favorite.

## Security and Configuration Notes

- Keep `.env` out of version control.
- Never commit API keys, tokens, or credentials.
- Add `.env`, `.venv/`, `venv/`, `__pycache__/`, and Python bytecode files to `.gitignore`.
- Do not expose API keys in frontend JavaScript. API calls requiring secrets should be made by the Flask backend.
- Configure appropriate CORS rules if the frontend and backend are served from different origins.
- Avoid logging secret values or full authorization headers.

### Example `.gitignore`

```gitignore
.env
.venv/
venv/
__pycache__/
*.py[cod]
```

## Troubleshooting

### The Frontend Cannot Connect to Flask

- Confirm that `python app.py` is still running.
- Check that the API URL in `index.js` matches the backend address and port.
- Review the browser console and Flask terminal for errors.

### Story Generation Fails

- Check that `GEMINI_API_KEY` is present and valid.
- Confirm that your Gemini API access and configured model are available.
- Review the Flask terminal for the provider's error message.

### Audio Generation Fails

- Check that `MURF_API_KEY` is present and valid.
- Verify your Murf API access and request limits.
- Review the Flask terminal for the response status and error details.

### Favorites Do Not Appear After Reopening

- Open the site in the same browser profile.
- Check whether browser storage is enabled.
- Make sure you are opening the site under the same origin, since browser storage can differ between origins.

## Future Enhancements

- Add user accounts and server-side favorite storage.
- Save audio files alongside favorite stories.
- Add a story history page and search.
- Add more languages and voice choices.
- Improve error messages and add API integration tests.
- Deploy the application with environment-based configuration and HTTPS.

## Project Summary

Cultural Storyteller demonstrates how generative AI and text-to-speech can be combined to make cultural knowledge more engaging and accessible. Users provide a topic, receive an AI-generated story, and can listen to the story in a supported language. The project also includes browser-based favorites and automated backend validation tests.

---

**Maintainer:** HASTHALAMANGALI SUPRAJA

**Project:** Cultural Storyteller

**GitHub Repository:** https://github.com/hmsupraja/AI-cultural-storyteller

**Technologies:** Python, Flask, Google Gemini AI, Murf AI, HTML, CSS, JavaScript
