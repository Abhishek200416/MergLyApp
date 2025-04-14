// -----------------------
// Lyrics Processing Logic
// -----------------------

/**
 * Cleans a single line of lyrics by removing unwanted patterns,
 * punctuation, numbers, and extra whitespace.
 */
function cleanLine(line) {
    line = line.replace(/\[.*?\]/g, '');                   // Remove text within square brackets
    line = line.replace(/["'“”‘’]+/g, '');                  // Remove quotes (straight and curly)
    line = line.replace(/\d+/g, '');                       // Remove any digits
    line = line.replace(/[\\\/]/g, '');                    // Remove forward/backward slashes
    line = line.replace(/[–—-]/g, '');                     // Remove dashes
    line = line.replace(/,/g, '');                         // Remove commas
    line = line.replace(/\.+/g, '');                       // Remove periods
    line = line.replace(/- .*/g, '');                      // Remove hyphen followed by space and everything after it
    line = line.replace(/\|\|.*?\|\|/g, '');               // Remove text between double pipe markers
    line = line.replace(/\(.*?\)/g, '');                   // Remove text within parentheses
    line = line.replace(/\s{2,}/g, ' ');                   // Collapse multiple spaces into one
    return line.trim();
}

/**
 * Splits text into lines, cleans each line, removes empty lines,
 * and collapses multiple newlines.
 */
function normalizeLines(text) {
    const lines = text.split(/\r?\n/);
    const cleaned = lines.map(line => cleanLine(line)).filter(line => line !== '');
    let normalizedText = cleaned.join('\n');
    normalizedText = normalizedText.replace(/\n{3,}/g, '\n\n');
    return normalizedText.split(/\r?\n/);
}

/**
 * Processes two sets of lyrics and merges them line-by-line.
 */
function processLyrics(firstLanguage, secondLanguage) {
    const firstLines = normalizeLines(firstLanguage);
    const secondLines = normalizeLines(secondLanguage);

    if (firstLines.length === 0 || secondLines.length === 0) {
        throw new Error("Both lyrics fields must contain text.");
    }

    const mergedLines = [];
    const maxLines = Math.max(firstLines.length, secondLines.length);
    for (let i = 0; i < maxLines; i++) {
        const line1 = i < firstLines.length ? firstLines[i] : "";
        const line2 = i < secondLines.length ? secondLines[i] : "";
        if (line1 || line2) {
            mergedLines.push(`${line1}\n${line2}`);
        }
    }
    return mergedLines.join('\n');
}

// -----------------------
// UI and Event Handling
// -----------------------

// Update preview with merged lyrics
function updatePreview(lyrics) {
    const previewElem = document.getElementById("mergedLyricsPreview");
    if (!previewElem) {
        console.error("Preview element not found!");
        return;
    }
    const lines = lyrics.split('\n');
    let htmlContent = "";
    for (let i = 0; i < lines.length; i++) {
        if (i % 2 === 0) {
            htmlContent += `<div class="first-line">${lines[i]}</div>`;
        } else {
            htmlContent += `<div class="second-line">${lines[i]}</div>`;
        }
    }
    previewElem.innerHTML = htmlContent;
}

// When the merge button is clicked, process and display lyrics.
document.getElementById("merge-btn")?.addEventListener("click", () => {
    const firstLanguage = document.getElementById("firstLanguage").value;
    const secondLanguage = document.getElementById("secondLanguage").value;

    if (!firstLanguage || !secondLanguage) {
        showNotification("Both lyrics fields must contain text.", "merge");
        return;
    }

    try {
        const mergedLyrics = processLyrics(firstLanguage, secondLanguage);
        localStorage.setItem("mergedLyrics", mergedLyrics);
        updatePreview(mergedLyrics);

        // Optionally update swap button icon here if needed.
        const swapBtn = document.getElementById("swap-btn");
        if (swapBtn) {
            const img = swapBtn.querySelector("img");
            if (img) {
                img.src = "../static/assets/Swap_Blue.svg";
            }
        }

        // Switch to the Preview tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="preview"]').classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById("preview").classList.add("active");

    } catch (err) {
        console.error("Error processing lyrics:", err);
        showNotification("An error occurred while processing lyrics: " + err.message, "merge");
    }
});

// Optionally load stored lyrics on page refresh in the preview tab.
if (document.getElementById("mergedLyricsPreview") && window.location.href.includes("main")) {
    const merged = localStorage.getItem("mergedLyrics");
    if (merged) {
        updatePreview(merged);
    }
}
