
const API_URL = "http://127.0.0.1:5000/generate-story";

const topicInput = document.getElementById("topicInput");
const searchBtn = document.getElementById("searchBtn");
const storyTitle = document.getElementById("storyTitle");
const storyForm = document.getElementById("storyForm");
const storyType = document.getElementById("storyType");
const language = document.getElementById("language");
const voice = document.getElementById("voice");
const generateBtn = document.getElementById("generateBtn");
const statusMessage = document.getElementById("statusMessage");
const resultSection = document.getElementById("resultSection");
const storyText = document.getElementById("storyText");
const transcriptText = document.getElementById("transcriptText");
const audioPlayer = document.getElementById("audioPlayer");
const downloadBtn = document.getElementById("downloadBtn");
const newStoryBtn = document.getElementById("newStoryBtn");

let currentAudioUrl = null;

function chooseStory(topic) {
    topicInput.value = topic;
    storyTitle.textContent = topic;
    topicInput.focus();

    document.getElementById("storyPanel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

document.querySelectorAll(".story-card").forEach(card => {
    card.addEventListener("click", () => {
        chooseStory(card.dataset.topic);
    });
});

searchBtn.addEventListener("click", () => {
    const topic = topicInput.value.trim();

    if (!topic) {
        statusMessage.textContent = "Please enter a story topic.";
        topicInput.focus();
        return;
    }

    chooseStory(topic);
});

topicInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        searchBtn.click();
    }
});

storyForm.addEventListener("submit", async event => {
    event.preventDefault();

    const topic = topicInput.value.trim();

    if (!topic) {
        statusMessage.textContent = "Please enter a story topic.";
        topicInput.focus();
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "Generating your story...";
    statusMessage.textContent =
        "Gemini is creating your story. Please wait.";

    resultSection.hidden = true;
    downloadBtn.hidden = true;

    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();

    if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                topic: topic,
                storyType: storyType.value,
                language: language.value,
                voice: voice.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to generate your story."
            );
        }

        if (!data.story || !data.audioBase64) {
            throw new Error("The server returned incomplete results.");
        }

        storyText.textContent = data.story;
        transcriptText.textContent = data.story;

        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const audioBlob = new Blob([bytes], {
            type: "audio/mpeg"
        });

        currentAudioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = currentAudioUrl;

        resultSection.hidden = false;
        downloadBtn.hidden = false;

        downloadBtn.onclick = () => {
            const link = document.createElement("a");
            link.href = currentAudioUrl;
            link.download = "cultural-story.mp3";
            link.click();
        };

        statusMessage.textContent =
            "Your story and audio are ready!";

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error("Story generation error:", error);

        statusMessage.textContent =
            error.message.includes("Failed to fetch")
                ? "Cannot connect to Flask. Make sure app.py is running."
                : error.message;

    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "✨ Generate Story & Audio";
    }
});

newStoryBtn.addEventListener("click", () => {
    audioPlayer.pause();
    resultSection.hidden = true;
    topicInput.focus();

    document.getElementById("storyPanel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});
