// ===== Advanced Auto-Scaling Logic for All Displays =====

// Define baseline dimensions (for example, designed for a 1920x1080 layout)
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;

// Optional: Define limits for the scale factor
const MIN_SCALE = 0.5; // do not shrink below 50%
const MAX_SCALE = 2.0; // do not enlarge past 200%

/**
 * Computes the dynamic scale factor based on the current viewport size.
 * It compares the current window dimensions against a target size,
 * then applies a clamping to ensure the scale remains within acceptable limits.
 */
function computeScaleFactor() {
    const scaleX = window.innerWidth / TARGET_WIDTH;
    const scaleY = window.innerHeight / TARGET_HEIGHT;
    let scaleFactor = Math.min(scaleX, scaleY);

    // Clamp the scaling factor to defined bounds.
    scaleFactor = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scaleFactor));

    console.log(`Computed scaleFactor = ${scaleFactor.toFixed(5)}`);
    return scaleFactor;
}

/**
 * Updates the scaling styles for the page.
 * It applies a transform with the computed scale factor and adjusts the body's width to maintain layout.
 * Also applies inverse scaling to any fixed-size elements.
 */
function updateScalingStyles(scaleFactor) {
    const transitionStyle = 'transform 1ms linear';

    // Check if browser supports the 'zoom' style; if not, use transform scaling.
    if (!('zoom' in document.body.style)) {
        // Apply CSS transform scaling
        document.body.style.transition = transitionStyle;
        document.body.style.transform = `scale(${scaleFactor})`;
        document.body.style.transformOrigin = 'top left';
        // Adjust body width to maintain proper layout width.
        document.body.style.width = `${100 / scaleFactor}%`;
    } else {
        // Fallback to using zoom if available (or you may always prefer transform)
        document.body.style.transition = 'zoom 1ms linear';
        document.body.style.zoom = scaleFactor;
        document.body.style.transform = '';
        document.body.style.width = '';
    }

    // Adjust fixed-size elements to counter-scale them so they appear at normal size.
    document.querySelectorAll('.fixed-size').forEach(el => {
        el.style.transition = transitionStyle;
        el.style.transform = `scale(${1 / scaleFactor})`;
        el.style.transformOrigin = 'center center';
    });

    // Once the scaling is applied, make the document visible.
    document.documentElement.style.visibility = 'visible';
}

/**
 * Applies scaling by computing the scale factor and updating styles accordingly.
 */
function applyScaling() {
    const scaleFactor = computeScaleFactor();
    updateScalingStyles(scaleFactor);
}

/**
 * Schedules a scaling update synchronized with the browser's rendering cycle.
 */
function scheduleScalingUpdate() {
    requestAnimationFrame(applyScaling);
}

// Initialize scaling as soon as the DOM is ready.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyScaling);
} else {
    applyScaling();
}

// Update scaling on window resize.
window.addEventListener('resize', scheduleScalingUpdate);

// Optionally, update scaling for zoom key events (Ctrl/Command + +, -, or =).
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        scheduleScalingUpdate();
    }
});
// ===== Tab Switching =====
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(tc => tc.classList.remove('active'));
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// ===== Swap Button Functionality =====
const swapButtons = document.querySelectorAll('.btn-swap');
swapButtons.forEach(button => {
    button.addEventListener('click', () => {
        const firstTextArea = document.getElementById('firstLanguage');
        const secondTextArea = document.getElementById('secondLanguage');
        const normalIcon = button.querySelector('.normal');
        const activeIcon = button.querySelector('.active');

        if (firstTextArea && secondTextArea && normalIcon && activeIcon) {
            // Swap the text content
            const temp = firstTextArea.value;
            firstTextArea.value = secondTextArea.value;
            secondTextArea.value = temp;

            // Show blue icon briefly
            normalIcon.classList.add('hidden');
            activeIcon.classList.remove('hidden');

            // Revert to normal icon after 300ms
            setTimeout(() => {
                activeIcon.classList.add('hidden');
                normalIcon.classList.remove('hidden');
            }, 300);
        }
    });
});

// ===== Drag & Drop Setup =====
function setupDragAndDrop(dropAreaId, fileInputId, textAreaId) {
    const dropArea = document.getElementById(dropAreaId);
    const fileInput = document.getElementById(fileInputId);
    const textArea = document.getElementById(textAreaId);
    if (dropArea && fileInput && textArea) {
        dropArea.addEventListener('click', () => fileInput.click());
        dropArea.addEventListener('dragover', e => {
            e.preventDefault();
            dropArea.classList.add('dragover');
        });
        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('dragover');
        });
        dropArea.addEventListener('drop', e => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = evt => textArea.value = evt.target.result;
                reader.readAsText(file);
            }
        });
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = evt => textArea.value = evt.target.result;
                reader.readAsText(file);
            }
        });
    }
}
setupDragAndDrop('dropArea1', 'fileInput1', 'firstLanguage');
setupDragAndDrop('dropArea2', 'fileInput2', 'secondLanguage');
setupDragAndDrop('dropAreaRegional', 'fileInputRegional', 'regionalText');

// ===== Merge Lyrics Operation =====
document.getElementById("merge-btn")?.addEventListener("click", () => {
    const firstLanguage = document.getElementById("firstLanguage").value.trim();
    const secondLanguage = document.getElementById("secondLanguage").value.trim();

    if (!firstLanguage || !secondLanguage) {
        // Here, a missing input error is treated as a merge error (blue)
        showNotification("Both lyrics fields must contain text.", "merge");
        return;
    }

    try {
        // Process merging using your processLyrics function defined in lyrics.js.
        const mergedLyrics = processLyrics(firstLanguage, secondLanguage);

        // Clear the preview panel first and update it
        const previewPanel = document.getElementById("mergedLyricsPreview");
        if (previewPanel) {
            previewPanel.innerHTML = "";
        }
        updatePreview(mergedLyrics);

        // Switch to the Preview tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="preview"]').classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        document.getElementById("preview").classList.add("active");

    } catch (err) {
        console.error("Error merging lyrics:", err);
        // Merge errors use blue notifications.
        showNotification("Unexpected error occurred while merging lyrics: " + err.message, "merge");
    }
});
// Optionally store merged lyrics in localStorage (if needed)
try {
    // Save the last merged lyrics (if available)
    const mergedLyrics = localStorage.getItem("mergedLyrics");
    if (mergedLyrics) {
        updatePreview(mergedLyrics);
    }
} catch (e) {
    console.error(e);
}

// ===== Export & Copy Functions =====
function downloadFile(content, filename, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
}

document.getElementById("export-txt")?.addEventListener("click", () => {
    const text = document.getElementById("mergedLyricsPreview").innerText;
    downloadFile(text, 'merged_lyrics.txt', 'text/plain');
});

document.getElementById("export-docx")?.addEventListener("click", () => {
    const previewContent = document.getElementById("mergedLyricsPreview").innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                      <head>
                        <meta charset='utf-8'>
                        <title>Exported Lyrics</title>
                        <style>
                          .first-line.bold, .second-line.bold, .bold { font-weight: bold; }
                          .first-line.italic, .second-line.italic, .italic { font-style: italic; }
                        </style>
                      </head>
                      <body>`;
    const footer = "</body></html>";
    const sourceHTML = header + previewContent + footer;
    downloadFile(sourceHTML, 'merged_lyrics.doc', 'application/vnd.ms-word');
});

document.getElementById("copy-text")?.addEventListener("click", function () {
    const btn = this;
    const originalText = btn.innerText;
    const text = document.getElementById("mergedLyricsPreview").innerText;
    navigator.clipboard.writeText(text)
        .then(() => {
            btn.innerText = "Copied!";
            setTimeout(() => {
                btn.innerText = originalText;
            }, 2000);
        })
        .catch(() => {
            showNotification("Failed to copy text.", "network");
        });
});

// ===== Global Application Script (Smooth Transitions & UI Enhancements) =====
document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            const splash = document.querySelector(".splash-screen");
            if (splash) {
                splash.classList.add("fade-out");
                setTimeout(() => {
                    window.location.href = "/main";
                }, 1000);
            }
        });
    }
});

// ===== Refresh Translate Section =====
document.getElementById("refreshTranslateSection")?.addEventListener("click", () => {
    document.getElementById("regionalText").value = "";
    document.getElementById("translatedText").value = "";
    previousRegionalText = "";
    localStorage.removeItem("translationCache");
    console.log("Translation section refreshed; all cache cleared.");
});

// ===== Preview Functionality =====
document.getElementById("preview-btn")?.addEventListener("click", () => {
    const translated = document.getElementById("translatedText").value;
    const previewPanel = document.getElementById("mergedLyricsPreview");
    const lines = translated.split("\n");
    let htmlContent = "";
    lines.forEach(line => {
        htmlContent += `<div>${line}</div>`;
    });
    previewPanel.innerHTML = htmlContent;
    previewPanel.contentEditable = true;
});
// ===== Toggle Style Functionality =====
function toggleStyle(language, style, btn) {
    const elements = document.querySelectorAll(`.${language}-line`);
    elements.forEach(el => {
        if (style === 'bold') {
            if (el.style.fontWeight === "bold") {
                el.style.fontWeight = "";
                el.classList.remove('bold');
            } else {
                el.style.fontWeight = "bold";
                el.classList.add('bold');
            }
        } else if (style === 'italic') {
            if (el.style.fontStyle === "italic") {
                el.style.fontStyle = "";
                el.classList.remove('italic');
            } else {
                el.style.fontStyle = "italic";
                el.classList.add('italic');
            }
        }
    });
    btn.classList.toggle('active-toggle');
}


// ===== Searchable Language Dropdown =====
const languages = [
    { name: "English", code: "en" },
    { name: "Hindi", code: "hi" },
    { name: "Telugu", code: "te" },
    { name: "Tamil", code: "ta" },
    { name: "Kannada", code: "kn" },
    { name: "Malayalam", code: "ml" },
    { name: "Punjabi", code: "pa" },
    { name: "Russian", code: "ru" },
    { name: "Thai", code: "th" },
    { name: "Ukrainian", code: "uk" },
    { name: "Japanese", code: "ja" },
    { name: "Chinese (Simplified)", code: "zh-CN" },
    { name: "Chinese (Traditional)", code: "zh-TW" }
];
const languageInput = document.getElementById('languageSearchInput');
const languageList = document.getElementById('languageList');

function populateLanguageList(filter = "") {
    languageList.innerHTML = "";
    languages.forEach(lang => {
        if (lang.name.toLowerCase().includes(filter.toLowerCase())) {
            const li = document.createElement('li');
            li.textContent = lang.name;
            li.dataset.lang = lang.code;
            li.addEventListener('click', () => {
                languageInput.value = lang.name;
                languageInput.dataset.lang = lang.code;
                languageList.style.display = "none";
            });
            languageList.appendChild(li);
        }
    });
    languageList.style.display = languageList.children.length ? "block" : "none";
}
populateLanguageList();
languageInput.addEventListener('input', (e) => {
    populateLanguageList(e.target.value);
});
languageInput.addEventListener('focus', () => {
    populateLanguageList(languageInput.value);
});
document.addEventListener('click', (e) => {
    if (!languageInput.contains(e.target) && !languageList.contains(e.target)) {
        languageList.style.display = "none";
    }
});

document.getElementById("export-btn")?.addEventListener("click", () => {
    const mergedLyrics = localStorage.getItem("mergedLyrics") || "";
    fetch("/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mergedLyrics })
    })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "merged_lyrics.docx";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => {
            console.error("Export error:", err);
            showNotification("Failed to export lyrics.", "network");
        });
});
