// ===============================
// CULTURAL STORYTELLER - index.js
// ===============================

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

const saveFavoriteBtn = document.getElementById("saveFavoriteBtn");
const favoritesList = document.getElementById("favoritesList");
const favoritesEmpty = document.getElementById("favoritesEmpty");

const FAVORITES_KEY = "culturalStorytellerFavorites";

let currentAudioUrl = null;
let loaderTimer = null;
let loaderIndex = 0;

const loadingMessages = [
    "✨ Preparing your cultural story...",
    "📖 Bringing traditions to life...",
    "🏛️ Exploring India's rich heritage...",
    "🎙️ Creating your narration...",
    "🪔 Almost ready — lighting up your story..."
];

// ===============================
// LOADING ANIMATION
// ===============================

const loader = document.createElement("div");
loader.id = "storyLoader";
loader.className = "story-loader";
loader.hidden = true;
loader.setAttribute("role", "status");
loader.setAttribute("aria-live", "polite");

const spinner = document.createElement("div");
spinner.className = "loader-spinner";
spinner.setAttribute("aria-hidden", "true");

const loaderMessage = document.createElement("p");
loaderMessage.className = "loader-message";

loader.append(spinner, loaderMessage);
storyForm.insertAdjacentElement("afterend", loader);

function startLoader() {
    stopLoaderTimer();
    loader.hidden = false;
    loaderIndex = 0;
    loaderMessage.textContent = loadingMessages[loaderIndex];

    loaderTimer = setInterval(() => {
        loaderIndex = (loaderIndex + 1) % loadingMessages.length;
        loaderMessage.textContent = loadingMessages[loaderIndex];
    }, 2400);
}

function stopLoaderTimer() {
    if (loaderTimer !== null) {
        clearInterval(loaderTimer);
        loaderTimer = null;
    }
}

function stopLoader() {
    stopLoaderTimer();
    loader.hidden = true;
}

// ===============================
// CHOOSE A STORY TOPIC
// ===============================

function chooseStory(topic) {
    if (!topic) return;

    topicInput.value = topic;
    storyTitle.textContent = topic;

    document.getElementById("storyPanel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    topicInput.focus({ preventScroll: true });
}

document.querySelectorAll(".story-card, .gallery-card").forEach(card => {
    card.addEventListener("click", () => {
        chooseStory(card.dataset.topic);
    });
});

// ===============================
// GALLERY CATEGORY FILTERS
// ===============================

const galleryFilters = document.querySelectorAll(".gallery-filter");
const galleryCards = document.querySelectorAll(".gallery-card");

galleryFilters.forEach(filterButton => {
    filterButton.addEventListener("click", () => {
        const selectedCategory = filterButton.dataset.filter;

        galleryFilters.forEach(button => {
            const active = button === filterButton;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        galleryCards.forEach(card => {
            card.hidden =
                selectedCategory !== "all" &&
                card.dataset.category !== selectedCategory;
        });
    });
});

// ===============================
// SEARCH
// ===============================

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

// ===============================
// FORMAT STORY TEXT
// ===============================

function formatStory(text) {
    const escapeHTML = value =>
        value.replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    let formatted = escapeHTML(text);

    formatted = formatted.replace(
        /^### (.+)$/gm,
        "<h3>$1</h3>"
    );

    formatted = formatted.replace(
        /^## (.+)$/gm,
        "<h2>$1</h2>"
    );

    formatted = formatted.replace(
        /^# (.+)$/gm,
        "<h2>$1</h2>"
    );

    formatted = formatted.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );

    formatted = formatted.replace(
        /\*(.+?)\*/g,
        "<em>$1</em>"
    );

    formatted = formatted.replace(/\n/g, "<br>");

    return formatted;
}

// ===============================
// GENERATE STORY AND AUDIO
// ===============================

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
    statusMessage.textContent = "";

    resultSection.hidden = true;
    downloadBtn.hidden = true;
    saveFavoriteBtn.hidden = true;

    startLoader();

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
                topic,
                storyType: storyType.value,
                language: language.value,
                voice: voice.value
            })
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "The server returned an invalid response. Check your Flask application."
            );
        }

        if (!response.ok) {
            throw new Error(data.error || "Unable to generate your story.");
        }

        if (!data.story || !data.audioBase64) {
            throw new Error(
                "The server response is missing story text or audio."
            );
        }

        storyTitle.textContent = topic;
        storyText.innerHTML = formatStory(data.story);
        transcriptText.textContent = data.story;

        // Convert Base64 audio into an MP3 blob.
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
        audioPlayer.load();

        resultSection.hidden = false;
        downloadBtn.hidden = false;
        saveFavoriteBtn.hidden = false;

        downloadBtn.onclick = () => {
            if (!currentAudioUrl) return;

            const link = document.createElement("a");
            link.href = currentAudioUrl;
            link.download = "cultural-story.mp3";

            document.body.appendChild(link);
            link.click();
            link.remove();
        };

        statusMessage.textContent = "Your story and audio are ready!";

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
        stopLoader();
        generateBtn.disabled = false;
        generateBtn.textContent = "✨ Generate Story & Audio";
    }
});

// ===============================
// CREATE ANOTHER STORY / RESET
// ===============================

newStoryBtn.addEventListener("click", () => {
    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();

    if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
    }

    stopLoader();

    resultSection.hidden = true;
    downloadBtn.hidden = true;
    saveFavoriteBtn.hidden = true;

    storyText.textContent = "";
    transcriptText.textContent = "";
    topicInput.value = "";
    storyTitle.textContent = "Create Your Cultural Story";
    statusMessage.textContent = "";

    generateBtn.disabled = false;
    generateBtn.textContent = "✨ Generate Story & Audio";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    topicInput.focus();
});

// ===============================
// FAVORITES STORAGE
// ===============================

function getFavoriteStories() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Could not read favorites:", error);
        return [];
    }
}

function storeFavoriteStories(stories) {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(stories));
        return true;
    } catch (error) {
        console.error("Could not save favorites:", error);

        statusMessage.textContent =
            "Unable to save favorites. Browser storage may be unavailable or full.";

        return false;
    }
}

// ===============================
// RENDER FAVORITES
// ===============================

function renderFavoriteStories() {
    const favorites = getFavoriteStories();

    favoritesList.replaceChildren();
    favoritesEmpty.hidden = favorites.length > 0;

    favorites.forEach(favorite => {
        const card = document.createElement("article");
        card.className = "favorite-card";

        const heading = document.createElement("h3");
        heading.textContent = favorite.title || favorite.topic;

        const meta = document.createElement("p");
        meta.className = "favorite-meta";
        meta.textContent =
            `${favorite.storyType || "Detailed"} · ` +
            `${favorite.language || "English"} · ` +
            `${favorite.voice || "Default"} voice`;

        const date = document.createElement("p");
        date.className = "favorite-date";

        const savedDate = favorite.savedAt
            ? new Date(favorite.savedAt)
            : null;

        date.textContent =
            savedDate && !Number.isNaN(savedDate.getTime())
                ? `Saved ${savedDate.toLocaleDateString()}`
                : "Saved story";

        const details = document.createElement("details");
        details.className = "favorite-details";

        const summary = document.createElement("summary");
        summary.textContent = "Read saved story";

        const story = document.createElement("p");
        story.className = "favorite-story-text";
        story.textContent = favorite.story || "";

        details.append(summary, story);

        const actions = document.createElement("div");
        actions.className = "favorite-actions";

        const useTopicBtn = document.createElement("button");
        useTopicBtn.type = "button";
        useTopicBtn.className = "favorite-use-btn";
        useTopicBtn.textContent = "Generate Again";

        useTopicBtn.addEventListener("click", () => {
            topicInput.value = favorite.topic || "";

            if (favorite.storyType) storyType.value = favorite.storyType;
            if (favorite.language) language.value = favorite.language;
            if (favorite.voice) voice.value = favorite.voice;

            storyTitle.textContent =
                favorite.title || favorite.topic || "Create Your Cultural Story";

            statusMessage.textContent =
                "Saved topic and preferences restored. Select Generate Story & Audio to create a new version.";

            document.getElementById("storyPanel").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            topicInput.focus({ preventScroll: true });
        });

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "favorite-remove-btn";
        removeBtn.textContent = "Remove";

        removeBtn.addEventListener("click", () => {
            const updatedFavorites = getFavoriteStories().filter(
                item => item.id !== favorite.id
            );

            if (storeFavoriteStories(updatedFavorites)) {
                renderFavoriteStories();
                statusMessage.textContent = "Favorite removed.";
            }
        });

        actions.append(useTopicBtn, removeBtn);
        card.append(heading, meta, date, details, actions);
        favoritesList.appendChild(card);
    });
}

// ===============================
// SAVE CURRENT STORY
// ===============================

saveFavoriteBtn.addEventListener("click", () => {
    const topic = topicInput.value.trim();
    const story = storyText.textContent.trim();

    if (!topic || !story) {
        statusMessage.textContent =
            "Generate a story before saving it to Favorites.";
        return;
    }

    const favorites = getFavoriteStories();

    const alreadySaved = favorites.some(
        favorite =>
            favorite.topic === topic &&
            favorite.story === story
    );

    if (alreadySaved) {
        statusMessage.textContent =
            "This story is already in your Favorites.";
        return;
    }

    const favorite = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        topic,
        title: storyTitle.textContent.trim() || topic,
        story,
        storyType: storyType.value,
        language: language.value,
        voice: voice.value,
        savedAt: new Date().toISOString()
    };

    if (storeFavoriteStories([favorite, ...favorites])) {
        renderFavoriteStories();
        statusMessage.textContent = "♡ Story saved to Favorites!";
    }
});

// Load saved stories when the page opens.
renderFavoriteStories();