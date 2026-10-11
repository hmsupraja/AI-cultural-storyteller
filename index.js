
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

    // Display status messages
    function showStatus(message, type = "info") {
        statusMessage.textContent = message;
        statusMessage.dataset.type = type;
        statusMessage.style.display = "block";
    }

    function clearStatus() {
        statusMessage.textContent = "";
        statusMessage.style.display = "none";
    }

    // Safely read favorites from localStorage
    function getFavorites() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(FAVORITES_KEY) || "[]"
            );

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Could not read favorites:", error);
            return [];
        }
    }

    // Remove common Markdown symbols from story previews
    function cleanPreview(text) {
        return String(text || "")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/^#{1,6}\s+/gm, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    // Display story text safely
    function renderStoryText(text) {
        storyText.replaceChildren();

        String(text || "")
            .split(/\n+/)
            .map(line => line.trim())
            .filter(Boolean)
            .forEach(line => {
                const paragraph = document.createElement("p");
                paragraph.textContent = line.replace(/^#{1,6}\s*/, "");
                storyText.appendChild(paragraph);
            });

        transcriptText.textContent = text || "";
    }

    // Clear the current audio and release temporary URLs
    function clearAudio() {
        audioPlayer.pause();
        audioPlayer.removeAttribute("src");
        audioPlayer.load();

        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
            currentAudioUrl = null;
        }

        downloadBtn.hidden = true;
        downloadBtn.removeAttribute("data-audio-url");
    }

    // Handle audio returned as Base64 or as a URL
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
                // Support either plain Base64 or a data URL
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
                console.error("Could not process Base64 audio:", error);
            }
        }

        if (audioUrl) {
            // Only accept HTTP(S) URLs or same-origin relative URLs
            try {
                const parsedUrl = new URL(audioUrl, window.location.origin);

                if (
                    parsedUrl.protocol === "https:" ||
                    parsedUrl.protocol === "http:"
                ) {
                    audioPlayer.src = parsedUrl.href;
                    downloadBtn.dataset.audioUrl = parsedUrl.href;
                    downloadBtn.hidden = false;
                }
            } catch (error) {
                console.error("Invalid audio URL:", error);
            }
        }
    }

    // Display a generated or saved story
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

    // Generate a story using the deployed Flask backend
    async function generateStory(event) {
        if (event) {
            event.preventDefault();
        }

        clearStatus();

        const topic = topicInput.value.trim();

        if (!topic) {
            showStatus(
                "Please enter a topic or select a story from the gallery.",
                "error"
            );
            topicInput.focus();
            return;
        }

        const originalButtonText = generateBtn.textContent;

        generateBtn.disabled = true;
        generateBtn.textContent = "Generating your story...";

        showStatus(
            "Generating your story and audio. Please wait...",
            "info"
        );

        // Prevent an indefinitely pending browser request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

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
                }),
                signal: controller.signal
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
                    `Request failed with status ${response.status}.`
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
                ...data,
                topic: topic,
                story: data.story,
                storyType: storyType.value,
                language: language.value,
                voice: voice.value,
                createdAt: new Date().toISOString()
            });

            showStatus("Your cultural story is ready!", "success");

        } catch (error) {
            console.error("Story generation failed:", error);

            if (error.name === "AbortError") {
                showStatus(
                    "The request took too long. Check Render logs and try again.",
                    "error"
                );
            } else if (error.message === "Failed to fetch") {
                showStatus(
                    "Could not connect to the Flask API. Check the Render service and /generate-story route.",
                    "error"
                );
            } else {
                showStatus(error.message, "error");
            }
        } finally {
            clearTimeout(timeoutId);
            generateBtn.disabled = false;
            generateBtn.textContent = originalButtonText;
        }
    }

    // Form submission
    storyForm.addEventListener("submit", generateStory);

    // Explore button: prepare the topic and move to the generator
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

    // Pressing Enter in the search field generates a story
    topicInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            generateStory();
        }
    });

    // Gallery card selection
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

    // Gallery category filters
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
    downloadBtn.addEventListener("click", async () => {
        const url = currentAudioUrl || downloadBtn.dataset.audioUrl;

        if (!url) {
            showStatus("No audio is available to download.", "error");
            return;
        }

        try {
            if (currentAudioUrl) {
                const link = document.createElement("a");
                link.href = currentAudioUrl;
                link.download = "cultural-story.mp3";
                document.body.appendChild(link);
                link.click();
                link.remove();
                return;
            }

            // Fetch remote audio where the server permits it
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
            console.error("Download error:", error);
            showStatus(
                "Could not download the audio. Try using the audio player's controls.",
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

        const alreadySaved = favorites.some(item =>
            item.topic === currentStory.topic &&
            item.story === currentStory.story
        );

        if (alreadySaved) {
            showStatus("This story is already in your favorites.", "info");
            return;
        }

        // Audio is not saved in localStorage
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
                "Could not save the story. Your browser storage may be full.",
                "error"
            );
        }
    });

    // Render the favorites list
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
            const cleanText = cleanPreview(favorite.story);
            preview.textContent =
                cleanText.length > 160
                    ? cleanText.slice(0, 160) + "..."
                    : cleanText;

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
                    "Saved story opened. Generate it again if you need audio.",
                    "info"
                );
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", () => {
                const updatedFavorites = getFavorites();
                updatedFavorites.splice(index, 1);

                localStorage.setItem(
                    FAVORITES_KEY,
                    JSON.stringify(updatedFavorites)
                );

                renderFavorites();
                showStatus("Favorite removed.", "success");
            });

            card.append(title, preview, readButton, removeButton);
            favoritesList.appendChild(card);
        });
    }

    // Create Another Story: clear all previous story inputs and results
    newStoryBtn.addEventListener("click", () => {
        currentStory = null;

        topicInput.value = "";
        storyTitle.textContent = "Create Your Cultural Story";

        storyType.selectedIndex = 0;
        language.selectedIndex = 0;
        voice.selectedIndex = 0;

        storyText.replaceChildren();
        transcriptText.textContent = "";

        resultSection.hidden = true;
        saveFavoriteBtn.hidden = true;

        clearAudio();
        clearStatus();

        topicInput.focus();

        window.scrollTo({
            top: $("storyPanel").getBoundingClientRect().top +
                window.scrollY - 20,
            behavior: "smooth"
        });
    });

    // Initialize the page
    resultSection.hidden = true;
    renderFavorites();
});
