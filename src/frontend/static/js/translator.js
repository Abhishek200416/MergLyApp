document.addEventListener("DOMContentLoaded", () => {
    const regionalText = document.getElementById("regionalText");
    const translatedText = document.getElementById("translatedText");
    const languageSelect = document.getElementById("languageSearchInput");
    const translateBtn = document.getElementById("translate-btn");
    const spinner = document.getElementById("loading-spinner");

    if (!regionalText || !translatedText || !languageSelect || !translateBtn || !spinner) {
        console.error("One or more translation input fields not found in the DOM.");
        return;
    }

    /**
     * Remove lines containing UniqueRef, purely numeric lines,
     * or lines starting with "UDC". Collapse multiple blank lines.
     */
    function cleanTranslation(raw) {
        const lines = raw.split(/\r?\n/);
        const cleaned = lines.filter(line => {
            const trimmed = line.trim();
            if (!trimmed) return false;
            if (/^UniqueRef\b/.test(trimmed)) return false;
            if (/^(?:\d+|UDC)\b/i.test(trimmed)) return false;
            return true;
        });
        return cleaned.join("\n").replace(/\n{2,}/g, "\n\n");
    }

    translateBtn.addEventListener("click", async() => {
        if (!navigator.onLine) {
            showNotification("Network error: Please connect to the Internet.", "network");
            translatedText.value = "Network error: Please connect to the Internet.";
            return;
        }

        const input = regionalText.value.trim();
        if (!input) {
            showNotification("Please enter text to translate.", "network");
            return;
        }

        const lang = languageSelect.dataset.lang;
        if (!lang) {
            showNotification("Please select the desired language.", "network");
            return;
        }

        translatedText.value = "Translating";
        spinner.style.display = "block";
        let dots = 0;
        const maxDots = 3;
        const intervalId = setInterval(() => {
            dots = (dots + 1) % (maxDots + 1);
            translatedText.value = "Translating" + ".".repeat(dots);
        }, 500);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch("http://127.0.0.1:5000/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input, targetLang: lang }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            clearInterval(intervalId);

            const data = await response.json();
            if (data.error) {
                showNotification(data.error, "network");
                translatedText.value = data.error;
            } else {
                const raw = data.translation || input;
                translatedText.value = cleanTranslation(raw);
            }
        } catch (err) {
            console.error("Translation error:", err);
            showNotification("Translation failed or timed out. Please try again later.", "network");
            translatedText.value = "Translation failed or timed out. Please try again later.";
        } finally {
            spinner.style.display = "none";
            clearInterval(intervalId);
        }
    });
});