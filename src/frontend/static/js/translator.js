document.addEventListener("DOMContentLoaded", function() {
    const regionalText = document.getElementById("regionalText");
    const translatedText = document.getElementById("translatedText");
    const languageSelect = document.getElementById("desiredLanguageSelect");
    const translateBtn = document.getElementById("translate-btn");

    if (!regionalText || !translatedText || !languageSelect || !translateBtn) {
        console.error("One or more translation input fields not found in the DOM.");
        return;
    }

    translateBtn.addEventListener("click", () => {
        const input = regionalText.value;
        const lang = languageSelect.value;

        translatedText.value = "Translating...";
        fetch("/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: input,
                    targetLang: lang,
                }),
            })
            .then((res) => res.json())
            .then((data) => {
                translatedText.value = data.translation || "Translation failed";
            })
            .catch((err) => {
                translatedText.value = "Error occurred while translating.";
                console.error(err);
            });
    });
});