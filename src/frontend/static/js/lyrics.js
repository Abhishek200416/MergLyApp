// Handles lyric merging operations and error handling in a professional manner.

document.getElementById("merge-btn")?.addEventListener("click", () => {
    const firstLanguage = document.getElementById("firstLanguage").value;
    const secondLanguage = document.getElementById("secondLanguage").value;

    fetch("/process_lyrics", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ firstLanguage, secondLanguage })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Save merged lyrics to local storage (if needed)
                localStorage.setItem("mergedLyrics", data.mergedLyrics);
                // Update the preview tab with the merged lyrics dynamically
                updatePreview(data.mergedLyrics);
                // Switch to the Preview tab
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('[data-tab="preview"]').classList.add('active');
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.getElementById("preview").classList.add("active");
            }
        })
        .catch(err => {
            console.error("Error processing lyrics:", err);
            alert("An unexpected error occurred. Please try again.");
        });
});

// Function to update the preview content with merged lyrics.
// Updated to target the correct textarea element.
function updatePreview(lyrics) {
    const previewTextArea = document.getElementById("mergedLyricsPreview");
    if (!previewTextArea) {
        console.error("Preview element not found!");
        return;
    }
    previewTextArea.value = lyrics;
}

// Optional: When the preview tab is loaded (if the page is refreshed), load the stored lyrics
if (document.getElementById("mergedLyricsPreview") && window.location.href.includes("main")) {
    const merged = localStorage.getItem("mergedLyrics");
    if (merged) {
        updatePreview(merged);
    }
}
