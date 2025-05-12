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