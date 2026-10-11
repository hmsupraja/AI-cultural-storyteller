
document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "/generate-story";
    const FAVORITES_KEY = "culturalStorytellerFavorites";

    const $ = (id) => document.getElementById(id);

    const topicInput = $("topicInput");
    const searchBtn = $("searchBtn");
    const storyTitle = $("storyTitle");
    const storyForm = $("storyForm");
    const storyType = $("storyType");
    const language = $("language");
    const voice = $("voice");
    const generateBtn = $("generateBtn");
    const statusMessage = $("statusMessage");
    const resultSection = $("resultSection");
    const storyText = $("storyText");
    const audioPlayer = $("audioPlayer");
    const downloadBtn = $("downloadBtn");
    const transcriptText = $("transcriptText");
    const saveFavoriteBtn = $("saveFavoriteBtn");
    const newStoryBtn = $("newStoryBtn");
    const favoritesList = $("favoritesList");
    const favoritesEmpty = $("favoritesEmpty");

    let currentStory = null;
    let currentAudioUrl = null;
    let activeController = null;

    // Status messages
    function showStatus(message, type = "info") {
        statusMessage.textContent = message;
        statusMessage.dataset.type = type;
        statusMessage.style.display = "block";
    }

    function clearStatus() {
        statusMessage.textContent = "";
        statusMessage.style.display = "none";
    }

    // Read saved stories
    function getFavorites() {
        try {
            const items = JSON.parse(
                localStorage.getItem(FAVORITES_KEY) || "[]"
            );
            return Array.isArray(items) ? items : [];
        } catch (error) {
            console.error("Could not read favorites:", error);
            return [];
        }
    }

    // Remove Markdown formatting from displayed text
    function cleanText(text) {
        return String(text || "")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/__(.*?)__/g, "$1")
            .replace(/(?<!\*)\*([^*\n]+)\*/g, "$1")
            .replace(/^#{1,6}\s+/gm, "")
            .trim();
    }

    // Display a story safely
    function renderStoryText(text) {
        storyText.replaceChildren();

        const cleaned = cleanText(text);

        cleaned.split(/\n+/).forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            const paragraph = document.createElement("p");
            paragraph.textContent = trimmed;
            storyText.appendChild(paragraph);
        });

        transcriptText.textContent = cleaned;
    }

    // Stop and remove previous audio
    function clearAudio() {
        audioPlayer.pause();
        audioPlayer.removeAttribute("src");
        audioPlayer.load();

        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
            currentAudioUrl = null;
        }

        downloadBtn.hidden = true;
        delete downloadBtn.dataset.audioUrl;
    }

    // Load audio returned by Flask
    function setAudio(data) {
        clearAudio();

        const base64Audio =
            data.audioBase64 ||
            data.audio_base64 ||
            data.audio_data;

        const audioUrl =
            data.audioUrl ||
            data.audio_url;

        if (base64Audio) {
            try {
                const base64 = String(base64Audio).includes(",")
                    ? String(base64Audio).split(",").pop()
                    : String(base64Audio);

                const binary = atob(base64);
                const bytes = new Uint8Array(binary.length);

                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }

                const blob = new Blob([bytes], {
                    type: "audio/mpeg"
                });

                currentAudioUrl = URL.createObjectURL(blob);
                audioPlayer.src = currentAudioUrl;
                downloadBtn.hidden = false;
                return;
            } catch (error) {
                console.error("Audio conversion failed:", error);
                showStatus(
                    "The story was generated, but the audio could not be loaded.",
                    "error"
                );
                return;
            }
        }

        if (audioUrl) {
            try {
                const parsed = new URL(audioUrl, window.location.origin);

                if (
                    parsed.protocol !== "https:" &&
                    parsed.protocol !== "http:"
                ) {
                    throw new Error("Unsupported audio URL.");
                }

                audioPlayer.src = parsed.href;
                downloadBtn.dataset.audioUrl = parsed.href;
                downloadBtn.hidden = false;
            } catch (error) {
                console.error("Invalid audio URL:", error);
            }
        }
    }

    // Show the newly generated or saved story
    function displayStory(data) {
        currentStory = data;

        storyTitle.textContent = data.topic || "Your Cultural Story";
        renderStoryText(data.story);

        resultSection.hidden = false;
        saveFavoriteBtn.hidden = false;

        setAudio(data);

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    // Reset the current result before starting another request
    function clearCurrentResult() {
        currentStory = null;

        resultSection.hidden = true;
        storyText.replaceChildren();
        transcriptText.textContent = "";

        saveFavoriteBtn.hidden = true;
        clearAudio();
    }

    // Generate a fresh story for the current search topic
    async function generateStory(event) {
        if (event) event.preventDefault();

        const topic = topicInput.value.trim();

        if (!topic) {
            showStatus("Please enter a story topic first.", "error");
            topicInput.focus();
            return;
        }

        // Cancel a previous request if one is still running
        if (activeController) {
            activeController.abort();
        }

        clearStatus();
        clearCurrentResult();

        // Capture current preferences before sending the request
        const requestBody = {
            topic: topic,
            storyType: storyType.value,
            language: language.value,
            voice: voice.value
        };

        storyTitle.textContent = topic;

        const originalButtonText = generateBtn.textContent;

        activeController = new AbortController();
        const controller = activeController;

        generateBtn.disabled = true;
        generateBtn.textContent = "Generating your story...";

        showStatus(
            `Generating a new story about ${topic}. Please wait...`,
            "info"
        );

        // Allow enough time for AI generation, but avoid endless loading
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, 180000);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
                cache: "no-store"
            });

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "The server returned an invalid response. Check your Flask logs."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    `Server error: ${response.status}`
                );
            }

            if (
                typeof data.story !== "string" ||
                !data.story.trim()
            ) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "The server returned no story."
                );
            }

            // Ignore a response if another request has replaced it
            if (activeController !== controller) return;

            // Display the response for the requested topic
            displayStory({
                ...data,
                topic: topic,
                story: data.story,
                storyType: requestBody.storyType,
                language: requestBody.language,
                voice: requestBody.voice,
                createdAt: new Date().toISOString()
            });

            showStatus("Your new cultural story is ready!", "success");

        } catch (error) {
            if (activeController !== controller) return;

            console.error("Story generation failed:", error);

            if (error.name === "AbortError") {
                showStatus(
                    "The request timed out or was cancelled. Check Render logs and try again.",
                    "error"
                );
            } else if (error.message === "Failed to fetch") {
                showStatus(
                    "Could not connect to Flask. Check your Render service and /generate-story route.",
                    "error"
                );
            } else {
                showStatus(error.message, "error");
            }
        } finally {
            clearTimeout(timeoutId);

            if (activeController === controller) {
                activeController = null;
                generateBtn.disabled = false;
                generateBtn.textContent = originalButtonText;
            }
        }
    }

    // Generate from the form
    storyForm.addEventListener("submit", generateStory);

    // Explore button: update the selected topic and go to the form
    searchBtn.addEventListener("click", () => {
        const topic = topicInput.value.trim();

        if (!topic) {
            showStatus("Enter a topic to explore.", "error");
            topicInput.focus();
            return;
        }

        clearStatus();
        storyTitle.textContent = topic;

        $("storyPanel").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // Pressing Enter in the search box starts generation
    topicInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            generateStory();
        }
    });

    // Gallery cards select custom topics
    document.querySelectorAll(".gallery-card").forEach(card => {
        card.addEventListener("click", () => {
            topicInput.value = card.dataset.topic || "";
            storyTitle.textContent =
                topicInput.value || "Create Your Cultural Story";

            clearStatus();

            $("storyPanel").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    // Filter gallery categories
    document.querySelectorAll(".gallery-filter").forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter || "all";

            document.querySelectorAll(".gallery-filter").forEach(item => {
                const active = item === button;
                item.classList.toggle("active", active);
                item.setAttribute("aria-pressed", String(active));
            });

            document.querySelectorAll(".gallery-card").forEach(card => {
                card.hidden =
                    filter !== "all" &&
                    card.dataset.category !== filter;
            });
        });
    });

    // Download audio
    downloadBtn.addEventListener("click", async () => {
        const url = currentAudioUrl || downloadBtn.dataset.audioUrl;

        if (!url) {
            showStatus("No audio is available to download.", "error");
            return;
        }

        if (currentAudioUrl) {
            const link = document.createElement("a");
            link.href = currentAudioUrl;
            link.download = "cultural-story.mp3";
            document.body.appendChild(link);
            link.click();
            link.remove();
            return;
        }

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Audio download failed.");
            }

            const blob = await response.blob();
            const temporaryUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = temporaryUrl;
            link.download = "cultural-story.mp3";
            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(temporaryUrl);
        } catch (error) {
            console.error("Audio download failed:", error);
            showStatus(
                "Could not download the audio. Try the audio player's controls.",
                "error"
            );
        }
    });

    // Save the current story
    saveFavoriteBtn.addEventListener("click", () => {
        if (!currentStory) {
            showStatus("Generate a story before saving it.", "error");
            return;
        }

        const favorites = getFavorites();

        const exists = favorites.some(item =>
            item.topic === currentStory.topic &&
            item.story === currentStory.story
        );

        if (exists) {
            showStatus("This story is already in your favorites.", "info");
            return;
        }

        // Audio is not stored in localStorage
        const {
            audioBase64,
            audio_base64,
            audio_data,
            audioUrl,
            audio_url,
            ...savedStory
        } = currentStory;

        try {
            favorites.unshift(savedStory);

            localStorage.setItem(
                FAVORITES_KEY,
                JSON.stringify(favorites)
            );

            renderFavorites();
            showStatus("Story saved to your favorites!", "success");
        } catch (error) {
            console.error("Could not save favorite:", error);
            showStatus(
                "Could not save the story. Browser storage may be full.",
                "error"
            );
        }
    });

    // Render saved stories
    function renderFavorites() {
        const favorites = getFavorites();

        favoritesList.replaceChildren();
        favoritesEmpty.hidden = favorites.length > 0;

        favorites.forEach((favorite, index) => {
            const card = document.createElement("article");
            card.className = "favorite-card";

            const title = document.createElement("h3");
            title.textContent = favorite.topic || "Cultural Story";

            const preview = document.createElement("p");
            const cleaned = cleanText(favorite.story);
            preview.textContent =
                cleaned.length > 160
                    ? cleaned.slice(0, 160) + "..."
                    : cleaned;

            const actions = document.createElement("div");
            actions.className = "favorite-actions";

            const readButton = document.createElement("button");
            readButton.type = "button";
            readButton.textContent = "Read Story";

            readButton.addEventListener("click", () => {
                topicInput.value = favorite.topic || "";

                displayStory({
                    ...favorite,
                    audioBase64: ""
                });

                showStatus(
                    "Saved story opened. Audio is not stored with favorites.",
                    "info"
                );
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "favorite-remove-btn";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", () => {
                const updated = getFavorites();
                updated.splice(index, 1);

                try {
                    localStorage.setItem(
                        FAVORITES_KEY,
                        JSON.stringify(updated)
                    );

                    renderFavorites();
                    showStatus("Favorite removed.", "success");
                } catch (error) {
                    console.error("Could not remove favorite:", error);
                    showStatus("Could not update favorites.", "error");
                }
            });

            actions.append(readButton, removeButton);
            card.append(title, preview, actions);
            favoritesList.appendChild(card);
        });
    }

    // Create Another Story: reset the search and previous result
    newStoryBtn.addEventListener("click", () => {
        // Cancel any pending request
        if (activeController) {
            activeController.abort();
            activeController = null;
        }

        topicInput.value = "";
        storyTitle.textContent = "Create Your Cultural Story";

        storyType.selectedIndex = 0;
        language.selectedIndex = 0;
        voice.selectedIndex = 0;

        clearCurrentResult();
        clearStatus();

        generateBtn.disabled = false;
        generateBtn.textContent = "✨ Generate Story & Audio";

        topicInput.focus();

        $("storyPanel").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // Initialize the page
    resultSection.hidden = true;
    saveFavoriteBtn.hidden = true;
    downloadBtn.hidden = true;

    renderFavorites();
});
