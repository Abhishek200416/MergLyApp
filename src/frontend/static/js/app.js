// Global application script for smooth page transitions and basic UI enhancements
document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            // Apply fade-out effect before redirecting to main interface
            document.querySelector(".splash-screen").classList.add("fade-out");
            setTimeout(() => {
                window.location.href = "/main";
            }, 1000);
        });
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
      alert("Failed to export lyrics.");
    });
  });
  