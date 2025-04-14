// ===== Overridden Scaling Logic for Mac Displays =====
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
// For Mac devices, this is the absolute scale factor to use.
const MAC_FIXED_SCALE = 1.8;

function isMacPlatform() {
    return navigator.platform && navigator.platform.toUpperCase().includes('MAC');
}

function overrideMacScaleFactor() {
    console.log('Overriding scaling factor for Mac display to:', MAC_FIXED_SCALE);
    return MAC_FIXED_SCALE;
}

function computeScaleFactor() {
    let scaleFactor;
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const isHighResMac = screen.width >= 3000 && screen.height >= 1900;
    if (isMac || isHighResMac) {
        scaleFactor = MAC_FIXED_SCALE;
        console.log('%c[Forced Mac Scaling] scaleFactor =', 'color: green;', scaleFactor);
    } else {
        const scaleX = window.innerWidth / TARGET_WIDTH;
        const scaleY = window.innerHeight / TARGET_HEIGHT;
        scaleFactor = Math.min(scaleX, scaleY);
        console.log('Non-Mac scaling: scaleFactor =', scaleFactor.toFixed(5));
    }
    return scaleFactor;
}

function updateScalingStyles(scaleFactor) {
    const transitionStyle = 'transform 1ms linear';
    if (isMacPlatform() || !('zoom' in document.body.style)) {
        document.body.style.transition = transitionStyle;
        document.body.style.transform = `scale(${scaleFactor})`;
        document.body.style.transformOrigin = 'top left';
        document.body.style.width = `${100 / scaleFactor}%`;
    } else {
        document.body.style.transition = 'zoom 1ms linear';
        document.body.style.zoom = scaleFactor;
        document.body.style.transform = '';
        document.body.style.width = '';
    }
    document.querySelectorAll('.fixed-size').forEach(el => {
        el.style.transition = transitionStyle;
        el.style.transform = `scale(${1 / scaleFactor})`;
        el.style.transformOrigin = 'center center';
    });
    document.documentElement.style.visibility = 'visible';
}

function applyScaling() {
    const scaleFactor = computeScaleFactor();
    updateScalingStyles(scaleFactor);
}

function scheduleScalingUpdate() {
    requestAnimationFrame(applyScaling);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyScaling);
} else {
    applyScaling();
}
window.addEventListener('resize', scheduleScalingUpdate);
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        scheduleScalingUpdate();
    }
});