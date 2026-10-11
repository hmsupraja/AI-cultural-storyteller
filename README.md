# 📖 Cultural Storyteller

Cultural Storyteller is an AI-powered web application that generates cultural stories from user-provided topics and converts them into spoken audio. It combines Google Gemini AI for story generation, Murf AI for text-to-speech, and a responsive frontend built with HTML, CSS, and JavaScript, supported by a Python Flask backend.

## 🌐 Live Demo

**Live Website:** https://cultural-storyteller.onrender.com

**GitHub Repository:** https://github.com/hmsupraja/AI-cultural-storyteller

*Note: The hosted application may take some time to respond after a period of inactivity.*

## ✨ Features

- **AI Story Generation:** Generate cultural stories about festivals, folklore, historical events, and regional traditions.
- **Custom Topics:** Enter topics beyond the predefined gallery.
- **Story Modes:** Choose between Summary and Detailed formats.
- **Multiple Languages:** Generate stories in supported languages, including English, Hindi, Tamil, and Telugu.
- **Text-to-Speech:** Convert generated stories into audio using Murf AI.
- **Audio Playback and Download:** Listen to generated audio and download it when available.
- **Story Transcript:** Read the generated story alongside the audio.
- **Topic Gallery:** Explore sample topics and filter them by category.
- **Favorites:** Save stories in browser storage and revisit or remove them later.
- **Input Validation:** Validate topics, story types, languages, and voices on the backend.
- **Automated Testing:** Test backend routes, input validation, and story-generation responses.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Python, Flask |
| AI Story Generation | Google Gemini API (`google-genai`) |
| Text-to-Speech | Murf AI API |
| Environment Configuration | `python-dotenv`, environment variables |
| HTTP Requests | `requests` |
| Cross-Origin Support | Flask-CORS |
| Testing | Python `unittest`, Flask test client, `unittest.mock` |
| Deployment | Render |
| Version Control | Git and GitHub |

## 📁 Project Structure

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

## 📋 Prerequisites

Before running the project, install or obtain:

- Python 3.10 or a compatible version supported by the installed dependencies.
- A Google Gemini API key.
- A Murf AI API key.
- Git.
- Visual Studio Code or another code editor.
- A modern web browser.
- An internet connection for the external AI services.

## 🚀 Installation and Setup

### 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/hmsupraja/AI-cultural-storyteller.git
cd AI-cultural-storyteller
```

If you have already downloaded the project, open its folder in Visual Studio Code and run the commands from the project root.

### 2. Create a Virtual Environment

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use Command Prompt instead:

```bat
.venv\Scripts\activate.bat
```

### 3. Install Dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Ensure `requirements.txt` includes the dependencies used by your application, such as Flask, Flask-CORS, Google GenAI, Requests, and python-dotenv. Include Gunicorn if it is used for deployment.

### 4. Configure Environment Variables

Create a file named `.env` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
MURF_API_KEY=your_murf_api_key_here
```

Replace the placeholder values with your own API keys. Keep the variable names consistent with those referenced in `app.py`.

**Security:** Never commit real API keys, tokens, or credentials to GitHub. Store deployment secrets in your hosting provider's environment-variable settings.

### 5. Start the Flask Application

Run:

```bash
python app.py
```

If Flask is configured to run on its default local address, open:

```text
http://127.0.0.1:5000
```

Keep the Flask process running while testing the application.

### 6. Open the Frontend

The recommended local setup is to serve `index.html`, `style.css`, `index.js`, and the assets from the Flask application or from a configured local web server.

If Flask serves the frontend at `/`, open:

```text
http://127.0.0.1:5000/
```

The frontend can then use a same-origin relative API URL such as:

```javascript
fetch("/generate-story", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        topic: "Diwali",
        storyType: "Summary",
        language: "English",
        voice: "Male"
    })
});
```

Do not open `index.html` directly using a `file://` URL if the JavaScript depends on a relative Flask API endpoint. If you serve the frontend and backend on different origins, configure the frontend API URL and Flask CORS settings accordingly.

## 📖 How to Use the Application

1. Open the Cultural Storyteller website.
2. Select a topic from the gallery or enter a custom topic in the search box.
3. Choose **Summary** or **Detailed** story mode.
4. Select a supported language.
5. Choose a narrator voice.
6. Click **Generate Story & Audio**.
7. Read the generated story and transcript.
8. Play the audio if audio generation succeeds.
9. Download the audio when the download option is available.
10. Save the story to Favorites if you want to revisit it.
11. Open saved stories or remove them from Favorites.
12. Click **Create Another Story** to start a new story.

## 🔌 API Reference

### `GET /`

Returns the application's home page or a status response, depending on the Flask route configuration.

### `POST /generate-story`

Accepts story-generation preferences and returns the generated story and any audio data produced by the backend.

#### Example Request

```json
{
  "topic": "The History of Charminar",
  "storyType": "Summary",
  "language": "English",
  "voice": "Male"
}
```

#### Example Successful Response

```json
{
  "story": "Generated cultural story text...",
  "audioBase64": "Base64-encoded audio data..."
}
```

These JSON examples describe the expected request and response format. The actual endpoint, accepted fields, response keys, and error handling must match the implementation in `app.py`.

### HTTP Status Codes

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `400 Bad Request` | Input validation failed |
| `500 Internal Server Error` | An unexpected server-side error occurred |

The exact status codes depend on the implemented Flask route and error handlers.

## ✅ Input Validation

The backend should validate incoming requests, including:

- Empty or missing topics.
- Unsupported story types.
- Unsupported languages.
- Unsupported voices.
- Missing or malformed request data.

Invalid inputs should return an appropriate error response, such as HTTP `400 Bad Request`, according to the application's validation logic.

## 🧪 Running the Tests

Run the backend unit tests from the project root:

```bash
python -m unittest test_app -v
```

The described test suite covers:

- The home endpoint.
- Empty-topic validation.
- Unsupported story-type validation.
- Unsupported-language validation.
- Unsupported-voice validation.
- Successful story-generation responses.

The successful-generation test uses mocked story and speech functions if implemented that way in `test_app.py`. Mocked tests do not require live Gemini or Murf API calls, and mock audio data may not be playable.

Use the actual output from your current test suite when reporting the final number of passing tests.

## ❤️ Favorites and Browser Storage

Favorites are stored in the browser's `localStorage` using the key:

```text
culturalStorytellerFavorites
```

This means:

- Saved stories persist across page refreshes in the same browser profile.
- Favorites are stored locally rather than in a server-side database.
- Favorites may not appear in another browser or device.
- Clearing browser storage may remove saved favorites.
- Generated audio is not saved with each favorite unless the implementation is changed.

## 🔐 Security Notes

- Keep `.env` out of version control.
- Never expose Gemini or Murf API keys in frontend JavaScript.
- Make API requests that require secret keys through the Flask backend.
- Configure CORS appropriately when the frontend and backend use different origins.
- Avoid logging API keys, authorization headers, or other credentials.
- Rotate any API keys that have been accidentally exposed.
- Configure environment variables separately for local development and deployment.

A suitable `.gitignore` should exclude sensitive and generated files, for example:

```gitignore
.env
.env.*
!.env.example

.venv/
venv/
__pycache__/
*.py[cod]

.vscode/
```

Review the existing `.gitignore` before replacing it so that any required project-specific exclusions are preserved.

## ☁️ Deployment on Render

The project can be deployed on Render as a Python Flask web service.

Typical deployment settings are:

**Build Command**

```bash
pip install -r requirements.txt
```

**Start Command**

```bash
gunicorn app:app
```

Configure these environment variables in the Render dashboard:

```text
GEMINI_API_KEY
MURF_API_KEY
```

Make sure Gunicorn is included in `requirements.txt` and that the Flask application object is named `app`.

The frontend files must be served by Flask or another configured web server. A successful deployment or HTTP `200` response alone does not guarantee that story generation, audio generation, and every frontend interaction work correctly.

## 🛠️ Troubleshooting

### Frontend Cannot Connect to Flask

- Confirm that the Flask backend is running.
- Check that the API URL in `index.js` matches the backend route.
- Verify that the frontend and backend origins are configured correctly.
- Inspect the browser console and Flask or Render logs.

### Story Generation Fails

- Verify that `GEMINI_API_KEY` is configured correctly.
- Check API access, model availability, quotas, and rate limits.
- Confirm that the request payload matches the Flask endpoint.
- Inspect server logs for the actual error message.

### Audio Generation Fails

- Verify that `MURF_API_KEY` is configured correctly.
- Check the speech API request format and supported voice settings.
- Review provider limits and server error messages.
- Confirm that the returned audio format matches what the frontend expects.

### Favorites Do Not Appear

- Use the same browser profile and origin.
- Ensure browser storage is enabled.
- Check for errors in the browser console.
- Remember that favorites are stored locally, not in a shared database.

### The Website Takes Time to Respond

A free hosting instance may need time to start after inactivity. Wait for the service to respond and inspect the hosting logs if requests continue to fail.

## 🔮 Future Enhancements

- Add user authentication.
- Store favorites and story history in a database.
- Save generated audio alongside favorite stories.
- Introduce story search and improved filtering.
- Support additional languages and narrator voices.
- Add API integration tests using controlled test environments.
- Improve loading indicators and error messages.
- Add accessibility enhancements and additional responsive layouts.
- Improve deployment monitoring and configuration management.

## 📝 Project Summary

Cultural Storyteller demonstrates how generative AI and text-to-speech technology can make cultural knowledge more engaging and accessible.

Users can enter a topic, generate an AI-assisted cultural story, read the transcript, and listen to spoken narration. The application also provides a topic gallery, language and story-mode preferences, audio controls, browser-based Favorites, and backend input validation.

## 👩‍💻 Maintainer

**HASTHALAMANGALI SUPRAJA**

**Project:** Cultural Storyteller

**GitHub Repository:** https://github.com/hmsupraja/AI-cultural-storyteller

**Live Website:** https://cultural-storyteller.onrender.com

**Technologies:** Python, Flask, Google Gemini AI, Murf AI, HTML, CSS, and JavaScript

---

*If you find this project useful, consider starring the repository on GitHub.*
