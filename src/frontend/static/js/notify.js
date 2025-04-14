// ===== Notification Function =====
function showNotification(message, errorType = "") {
    const banner = document.getElementById("notificationBanner");
    if (!banner) {
        console.error("Notification banner element not found.");
        return;
    }
    // Set background color based on errorType
    banner.style.backgroundColor = errorType === "network" ? "#f44336" : "#2196F3";
    banner.textContent = message;
    banner.style.transform = "translateX(100%)";
    banner.style.opacity = "0";
    banner.style.display = "block";
    // Slide in animation
    setTimeout(() => {
        banner.style.transform = "translateX(0)";
        banner.style.opacity = "1";
    }, 50);
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        banner.style.transform = "translateX(100%)";
        banner.style.opacity = "0";
    }, 5000);
}

// ===== Network Error Notification =====
function showNetworkError(message) {
    showNotification(message, "network");
}