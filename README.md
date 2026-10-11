# Cultural Storyteller

Cultural Storyteller is an AI-powered web application that generates cultural stories from user-provided topics and converts them into spoken audio. It combines Google Gemini AI for story generation, Murf AI for text-to-speech, and a responsive frontend built with HTML, CSS, and JavaScript, supported by a Python Flask backend.

## Features

- **AI Story Generation:** Generate cultural stories about festivals, folk tales, historical events, and regional traditions.
- **Story Modes:** Choose between Summary and Detailed formats.
- **Multiple Languages:** Generate stories in supported languages, including English, Hindi, Tamil, and Telugu.
- **Text-to-Speech:** Convert generated stories into audio using Murf AI.
- **Audio Playback and Download:** Listen to generated audio and download it as an MP3 file.
- **Story Transcript:** Read the generated story alongside the audio.
- **Topic Gallery:** Explore sample topics and filter them by category.
- **Favorites:** Save stories in browser storage and revisit them later.
- **Input Validation:** Validate topics, story types, languages, and voices.
- **Automated Testing:** Test backend routes, input validation, and successful story-generation responses.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| AI Story Generation | Google Gemini API (`google-genai`) |
| Text-to-Speech | Murf AI API |
| Environment Configuration | `python-dotenv`, environment variables |
| Testing | Python `unittest`, Flask test client, `unittest.mock` |

## Project Structure

```text
AI-cultural-storyteller/
├── app.py
├── index.html
├── style.css
├── index.js
├── test_app.py
├── requirements.txt
├── .gitignore
├── README.md
└── assets/
    └── cultural-hero.png
```

The `.env` file and virtual environment are created locally and should not be committed to GitHub.

## Prerequisites

- Python 3.10 or a compatible version supported by the dependencies
- Google Gemini API key
- Murf AI API key
- A modern web browser
- Visual Studio Code or another code editor

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hmsupraja/AI-cultural-storyteller.git
cd AI-cultural-storyteller
```

If you have already downloaded the project, open its folder in Visual Studio Code and run the following commands from the project root.

### 2. Create a Virtual Environment

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and add your API keys:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
MURF_API_KEY=your_murf_api_key_here
```

Replace the placeholder values with your actual API keys. Ensure that the variable names match those used in `app.py`.

**Security:** Never commit actual API keys, access tokens, or credentials to GitHub.

### 5. Start the Flask Backend

Run:

```powershell
python app.py
```

The application is expected to run at:

```text
http://127.0.0.1:5000
```

Use the address printed in your terminal if it differs. Keep the backend running while using the application.

### 6. Open the Frontend

Open `index.html` in your browser or use a local development server. Make sure the API URL configured in `index.js` points to the running Flask backend.

The story-generation endpoint is:

```text
http://127.0.0.1:5000/generate-story
```

## How to Use the Application

1. Open the Cultural Storyteller web application.
2. Select a sample topic or enter your own topic.
3. Choose Summary or Detailed story mode.
4. Select a supported language and voice.
5. Generate the cultural story.
6. Read the generated story in the transcript section.
7. Play the generated audio.
8. Download the audio if needed.
9. Save the story to Favorites.
10. Revisit or remove saved stories from the Favorites section.

## API Reference

### `GET /`

Returns the application's home page if the Flask application is configured to serve it at this route.

### `POST /generate-story`

Accepts story-generation details and returns the generated story and audio data.

**Example request:**

```json
{
  "topic": "Diwali",
  "storyType": "Summary",
  "language": "English",
  "voice": "Male"
}
```

**Example successful response:**

```json
{
  "story": "Generated story text...",
  "audioBase64": "Base64-encoded audio data..."
}
```

The example illustrates the expected response fields. Refer to `app.py` for the actual implementation and any additional response fields.

### Input Validation

The backend tests cover invalid inputs, including:

- Empty topics
- Unsupported story types
- Unsupported languages
- Unsupported voices

Invalid inputs are expected to return HTTP `400 Bad Request`, as defined by the application's validation logic.

## Running the Tests

Run the backend unit tests from the project root:

```powershell
python -m unittest test_app -v
```

The test suite covers:

1. The home endpoint returns HTTP 200.
2. An empty topic returns HTTP 400.
3. An unsupported story type returns HTTP 400.
4. An unsupported language returns HTTP 400.
5. An unsupported voice returns HTTP 400.
6. Successful story generation returns HTTP 200 with the expected response fields.

The successful-generation test uses mocked story and speech functions. It does not require live Gemini or Murf API calls, and its mock audio data is not playable audio.

## Favorites and Browser Storage

The application stores Favorites in the browser's `localStorage` using the key:

```text
culturalStorytellerFavorites
```

Saved stories persist across page refreshes in the same browser profile. Favorites are stored locally rather than in a server-side database, and generated audio is not saved as part of each favorite.

## Security Notes

- Keep `.env` out of version control.
- Never expose API keys in frontend JavaScript.
- Make requests requiring secret API keys through the Flask backend.
- Exclude `.env`, `.venv/`, `venv/`, `__pycache__/`, and Python bytecode files using `.gitignore`.
- Configure CORS appropriately if the frontend and backend use different origins.
- Avoid logging API keys, tokens, or authorization headers.

## Troubleshooting

### Frontend Cannot Connect to Flask

- Confirm that the Flask backend is running.
- Check the API URL in `index.js`.
- Review the browser console and Flask terminal for errors.

### Story Generation Fails

- Verify that `GEMINI_API_KEY` is configured correctly.
- Check Gemini API access and model availability.
- Review the backend terminal for error messages.

### Audio Generation Fails

- Verify that `MURF_API_KEY` is configured correctly.
- Check Murf API access and request limits.
- Review the backend terminal for provider errors.

### Favorites Do Not Appear

- Use the same browser profile.
- Ensure browser storage is enabled.
- Open the application under the same origin, because browser storage can differ between origins.

## Future Enhancements

- Add user authentication and server-side favorite storage.
- Save generated audio alongside favorite stories.
- Introduce story history and search functionality.
- Support additional languages and voices.
- Expand automated testing with API integration tests.
- Deploy the application using environment-based configuration and HTTPS.

## Project Summary

Cultural Storyteller demonstrates how generative AI and text-to-speech technology can make cultural knowledge more engaging and accessible. Users provide a topic, receive an AI-generated cultural story, and listen to the result using speech synthesis. The application also provides story transcripts, browser-based Favorites, audio playback, and backend input validation.

---

**Maintainer:** HASTHALAMANGALI SUPRAJA

**Project:** Cultural Storyteller

**GitHub Repository:** https://github.com/hmsupraja/AI-cultural-storyteller

**Technologies:** Python, Flask, Google Gemini AI, Murf AI, HTML, CSS, JavaScript
