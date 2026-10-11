
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

    function showStatus(message, type = "info") {
        statusMessage.textContent = message;
        statusMessage.dataset.type = type;
        statusMessage.style.display = "block";
    }

    function clearStatus() {
        statusMessage.textContent = "";
        statusMessage.style.display = "none";
    }

    function getFavorites() {
        try {
            const data = JSON.parse(
                localStorage.getItem(FAVORITES_KEY) || "[]"
            );
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function renderStoryText(text) {
        storyText.replaceChildren();

        String(text || "")
            .split(/\n+/)
            .map(line => line.trim())
            .filter(Boolean)
            .forEach(line => {
                const paragraph = document.createElement("p");
                paragraph.textContent = line.replace(/^#+\s*/, "");
                storyText.appendChild(paragraph);
            });

        transcriptText.textContent = text || "";
    }

    function clearAudio() {
        audioPlayer.pause();
        audioPlayer.removeAttribute("src");
        audioPlayer.load();

        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
            currentAudioUrl = null;
        }
    }

    function displayStory(story) {
        currentStory = story;

        storyTitle.textContent = story.topic || "Your Cultural Story";
        renderStoryText(story.story);

        resultSection.hidden = false;
        saveFavoriteBtn.hidden = false;
        downloadBtn.hidden = true;

        clearAudio();

        if (story.audioBase64) {
            try {
                const binary = atob(story.audioBase64);
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
            } catch (error) {
                console.error("Audio loading error:", error);
                showStatus(
                    "Story generated, but the audio could not be loaded.",
                    "error"
                );
            }
        }

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    async function generateStory(event) {
        if (event) event.preventDefault();

        clearStatus();

        const topic = topicInput.value.trim();

        if (!topic) {
            showStatus("Please enter a story topic or select a story card.", "error");
            topicInput.focus();
            return;
        }

        const originalText = generateBtn.textContent;
        generateBtn.disabled = true;
        generateBtn.textContent = "Generating your story...";

        showStatus("Generating your story and audio. Please wait...", "info");

        try {
            // Relative URL works on the deployed Render website.
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

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "Unexpected server response. Check the Flask endpoint."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    `Server error: ${response.status}`
                );
            }

            if (!data.story) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "The server did not return a story."
                );
            }

            displayStory({
                topic: topic,
                story: data.story,
                audioBase64: data.audioBase64 || "",
                storyType: storyType.value,
                language: language.value,
                voice: voice.value,
                createdAt: new Date().toISOString()
            });

            showStatus("Your cultural story is ready!", "success");

        } catch (error) {
            console.error("Generation error:", error);

            showStatus(
                error.message === "Failed to fetch"
                    ? "Could not reach the Flask API. Check your Render logs and API route."
                    : error.message,
                "error"
            );
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = originalText;
        }
    }

    // Generate using the form
    storyForm.addEventListener("submit", generateStory);

    // Explore the typed topic
    searchBtn.addEventListener("click", () => {
        if (!topicInput.value.trim()) {
            showStatus("Enter a topic to explore.", "info");
            topicInput.focus();
            return;
        }

        storyTitle.textContent = topicInput.value.trim();
        $("storyPanel").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // Allow Enter in the topic box to start generation
    topicInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            generateStory();
        }
    });

    // Select a topic from the gallery
    document.querySelectorAll(".gallery-card").forEach(card => {
        card.addEventListener("click", () => {
            topicInput.value = card.dataset.topic || "";
            storyTitle.textContent = topicInput.value;

            $("storyPanel").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    // Filter the gallery
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

    // Download generated audio
    downloadBtn.addEventListener("click", () => {
        if (!currentAudioUrl) {
            showStatus("No audio is available to download.", "error");
            return;
        }

        const link = document.createElement("a");
        const filename = (currentStory?.topic || "cultural-story")
            .replace(/[^a-z0-9_-]/gi, "-");

        link.href = currentAudioUrl;
        link.download = `${filename}.mp3`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    });

    // Save the current story to favorites
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

        // Keep audio out of localStorage to avoid storing large data.
        const { audioBase64, ...savedStory } = currentStory;

        favorites.unshift(savedStory);

        try {
            localStorage.setItem(
                FAVORITES_KEY,
                JSON.stringify(favorites)
            );
            renderFavorites();
            showStatus("Story saved to your favorites!", "success");
        } catch (error) {
            console.error("Favorites storage error:", error);
            showStatus("Could not save the story in browser storage.", "error");
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
            preview.textContent =
                String(favorite.story || "").slice(0, 160) +
                (String(favorite.story || "").length > 160 ? "..." : "");

            const openButton = document.createElement("button");
            openButton.type = "button";
            openButton.textContent = "Read Story";
            openButton.addEventListener("click", () => {
                topicInput.value = favorite.topic || "";
                displayStory({
                    ...favorite,
                    audioBase64: ""
                });
                showStatus("Opened saved story. Audio is not stored in favorites.", "info");
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                const updated = getFavorites();
                updated.splice(index, 1);

                localStorage.setItem(
                    FAVORITES_KEY,
                    JSON.stringify(updated)
                );

                renderFavorites();
            });

            card.append(title, preview, openButton, removeButton);
            favoritesList.appendChild(card);
        });
    }

    // Create another story
    newStoryBtn.addEventListener("click", () => {
        currentStory = null;
        resultSection.hidden = true;
        clearAudio();
        clearStatus();
        topicInput.focus();
    });

    renderFavorites();
});
