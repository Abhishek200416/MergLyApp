
// ===== Scaling Logic =====
// ===== Overridden Scaling Logic for Mac Displays =====
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
// For Mac devices, this is the absolute scale factor to use.
const MAC_FIXED_SCALE = 1.9;

function isMacPlatform() {
    return navigator.platform && navigator.platform.toUpperCase().includes('MAC');
}

/**
 * Override function for Mac devices that forces the scaling factor
 * to a constant value (MAC_FIXED_SCALE) regardless of window dimensions.
 */
function overrideMacScaleFactor() {
    console.log('Overriding scaling factor for Mac display to:', MAC_FIXED_SCALE);
    return MAC_FIXED_SCALE;
}

/**
 * Computes the scale factor.
 * - For Mac devices, returns the override value from overrideMacScaleFactor.
 * - For non-Mac devices, computes the factor based on the minimum of width/height ratios.
 */
function computeScaleFactor() {
    let scaleFactor;

    // Force scale factor for Mac devices based on platform and resolution.
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const isHighResMac = screen.width >= 3000 && screen.height >= 1900;

    if (isMac || isHighResMac) {
        scaleFactor = 1.9; // Completely override and force it.
        console.log('%c[Forced Mac Scaling] scaleFactor =', 'color: green;', scaleFactor);
    } else {
        // Standard dynamic scaling for other devices
        const scaleX = window.innerWidth / TARGET_WIDTH;
        const scaleY = window.innerHeight / TARGET_HEIGHT;
        scaleFactor = Math.min(scaleX, scaleY);
        console.log('Non-Mac scaling: scaleFactor =', scaleFactor.toFixed(5));
    }

    return scaleFactor;
}


/**
 * Updates the scaling styles with a nearly instantaneous CSS transition.
 * Fixed-size elements are counter-scaled to retain their intended dimensions.
 */
function updateScalingStyles(scaleFactor) {
    // Use a nearly instantaneous transition (1ms) for imperceptible scaling.
    const transitionStyle = 'transform 1ms linear';

    if (isMacPlatform() || !('zoom' in document.body.style)) {
        document.body.style.transition = transitionStyle;
        document.body.style.transform = `scale(${scaleFactor})`;
        document.body.style.transformOrigin = 'top left';
        // Adjust body width to ensure layout reflows correctly.
        document.body.style.width = `${100 / scaleFactor}%`;
    } else {
        document.body.style.transition = 'zoom 1ms linear';
        document.body.style.zoom = scaleFactor;
        document.body.style.transform = '';
        document.body.style.width = '';
    }

    // Adjust fixed-size elements so that they remain visually unchanged.
    document.querySelectorAll('.fixed-size').forEach(el => {
        el.style.transition = transitionStyle;
        el.style.transform = `scale(${1 / scaleFactor})`;
        el.style.transformOrigin = 'center center';
    });

    document.documentElement.style.visibility = 'visible';
}

/**
 * Applies the scaling by computing and then updating the styles.
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

// Listen for window resize events.
window.addEventListener('resize', scheduleScalingUpdate);

// Optionally, listen for zoom key events (like Ctrl/Command + +, -, =) and update scaling accordingly.
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
