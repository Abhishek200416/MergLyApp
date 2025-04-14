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

    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const mergedLyrics = localStorage.getItem("mergedLyrics") || "";

            if (!mergedLyrics.trim()) {
                alert("No lyrics to export. Please merge lyrics first.");
                return;
            }

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
                    alert("Failed to export lyrics. Please try again.");
                });
        });
    }
});