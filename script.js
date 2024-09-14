function enableDrag(element, updateFunction) {
    let isDragging = false;
    let startX = 0;
    let elementX = 0;

    function dragStart(e) {
        e.preventDefault();
        isDragging = true;

        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        elementX = element.offsetLeft;

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }

    function dragMove(e) {
        if (!isDragging) return;

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const dx = clientX - startX;
        let newLeft = elementX + dx;

        // Restrict the handle's position within its container
        const minLeft = 0;
        const maxLeft = element.parentNode.offsetWidth - element.offsetWidth;
        if (newLeft < minLeft) newLeft = minLeft;
        if (newLeft > maxLeft) newLeft = maxLeft;

        element.style.left = newLeft + 'px';
        updateFunction(element, newLeft);
    }

    function dragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchend', dragEnd);
    }

    element.addEventListener('mousedown', dragStart);
    element.addEventListener('touchstart', dragStart);
}

// Drawing the Carve Ability line with the first 30% slightly wavy
function drawCarveLine() {
    const carveCanvas = document.getElementById('carveCanvas');
    const ctx = carveCanvas.getContext('2d');
    const width = carveCanvas.width;
    const height = carveCanvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    const wavinessEnd = width * 0.3; // 30% of the width
    const amplitude = 5; // Adjust the amplitude for slight waviness
    const wavelength = 50; // Adjust the wavelength for waviness frequency

    for (let x = 0; x <= width; x++) {
        let y;
        if (x <= wavinessEnd) {
            y = height / 2 + Math.sin((x / wavelength) * Math.PI * 2) * amplitude;
        } else {
            y = height / 2;
        }
        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function updateCarve(element, position) {
    const range = element.parentNode.offsetWidth - element.offsetWidth;
    const percent = position / range;
    const value = Math.round(percent * 10 - 5); // From -5 to +5
    element.textContent = value;
}

function updatePivot(element, position) {
    const range = element.parentNode.offsetWidth - element.offsetWidth;
    const percent = position / range;
    const value = Math.round(percent * 20 - 10); // From -10 to +10
    element.textContent = value;

    const pivotLine = document.querySelector('.pivot-line');

    // Adjusting stance profile: Tail high and Nose high each move up/down by 5%
    const maxShift = 5; // Maximum shift percentage
    const tailHighShift = value < 0 ? (Math.abs(value) / 10) * maxShift : 0; // Tail High moves when value is negative
    const noseHighShift = value > 0 ? (value / 10) * maxShift : 0; // Nose High moves when value is positive

    // Apply transformation
    pivotLine.style.transformOrigin = 'center';
    pivotLine.style.transform = `skewY(${noseHighShift - tailHighShift}deg)`;
}

function updateTriangle(element, position) {
    const range = element.parentNode.offsetWidth - element.offsetWidth;
    const percent = position / range;
    const value = Math.round(percent * 13); // From 0 to 13
    element.textContent = value;
}

function updateDynamic(element, position) {
    const range = element.parentNode.offsetWidth - element.offsetWidth;
    const percent = position / range;
    const value = Math.round(percent * 10 - 5); // From -5 to +5
    element.textContent = value;
}

function updateRoll(element, position) {
    const range = element.parentNode.offsetWidth - element.offsetWidth;
    const percent = position / range;
    const value = Math.round(percent * 10 - 5); // From -5 to +5
    element.textContent = value;
}

function updateYaw(element, position) {
    const range = element.parentNode.offsetWidth - element.offsetWidth;
    const percent = position / range;
    const value = Math.round(percent * 10 - 5); // From -5 to +5
    element.textContent = value;
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize drag functionality for all sliders
    enableDrag(document.querySelector('.carve-handle'), updateCarve);
    enableDrag(document.querySelector('.pivot-handle'), updatePivot);
    enableDrag(document.querySelector('.triangle-handle'), updateTriangle);
    enableDrag(document.querySelector('.dynamic-handle'), updateDynamic);
    enableDrag(document.querySelector('.roll-handle'), updateRoll);
    enableDrag(document.querySelector('.yaw-handle'), updateYaw);

    // Initialize Carve Canvas
    const carveCanvas = document.createElement('canvas');
    carveCanvas.id = 'carveCanvas';
    carveCanvas.width = 400; // Match the width of .carve-line
    carveCanvas.height = 50; // Match the height of .carve-line
    document.querySelector('.carve-line').appendChild(carveCanvas);
    drawCarveLine(); // Draw the static wavy line once

    // Zone Engagement Logic
    const dualZoneOption = document.getElementById('dual-zone');
    const singleZoneOption = document.getElementById('single-zone');

    // Default selection
    let selectedZone = 'dual-zone'; // or 'single-zone' as per your preference
    dualZoneOption.classList.add('zone-selected');

    function selectZone(zoneId) {
        if (zoneId === 'dual-zone') {
            dualZoneOption.classList.add('zone-selected');
            singleZoneOption.classList.remove('zone-selected');
            selectedZone = 'dual-zone';
        } else if (zoneId === 'single-zone') {
            singleZoneOption.classList.add('zone-selected');
            dualZoneOption.classList.remove('zone-selected');
            selectedZone = 'single-zone';
        }
    }

    dualZoneOption.addEventListener('click', function() {
        selectZone('dual-zone');
    });

    singleZoneOption.addEventListener('click', function() {
        selectZone('single-zone');
    });

    // Share settings functionality
    function shareSettings() {
        const params = new URLSearchParams({
            carve: document.querySelector('.carve-handle').textContent,
            stance: document.querySelector('.pivot-handle').textContent,
            aggressive: document.querySelector('.triangle-handle').textContent,
            dynamic: document.querySelector('.dynamic-handle').textContent,
            roll: document.querySelector('.roll-handle').textContent,
            yaw: document.querySelector('.yaw-handle').textContent,
            zone: selectedZone
        });

        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Settings URL copied to clipboard: ' + shareUrl);
            }).catch(err => {
                console.error('Error copying URL to clipboard:', err);
                prompt('Copy this URL:', shareUrl);
            });
        } else {
            // Fallback for insecure context or unsupported browser
            prompt('Copy this URL:', shareUrl);
        }
    }

    document.querySelector('.share-button').addEventListener('click', shareSettings);

    // Move the loadSettingsFromURL call to window.onload
    window.addEventListener('load', function() {
        loadSettingsFromURL();
    });

    // Load settings from URL parameters
    function loadSettingsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        // Helper function to set slider position based on value
        function setSlider(handleSelector, updateFunction, value, minValue, maxValue) {
            const handle = document.querySelector(handleSelector);
            if (!handle) {
                console.error('Handle not found:', handleSelector);
                return;
            }
            const container = handle.parentNode;
            const range = container.offsetWidth - handle.offsetWidth;

            // Ensure range is not zero to prevent division by zero
            if (range === 0) {
                console.error('Container width not available yet for:', handleSelector);
                return;
            }

            // Calculate position based on value
            const percent = (value - minValue) / (maxValue - minValue);
            const position = percent * range;

            handle.style.left = position + 'px';
            updateFunction(handle, position);
        }

        // Load Carve Ability
        if (urlParams.has('carve')) {
            const carveValue = parseInt(urlParams.get('carve'));
            setSlider('.carve-handle', updateCarve, carveValue, -5, 5);
        }

        // Load Stance Profile
        if (urlParams.has('stance')) {
            const stanceValue = parseInt(urlParams.get('stance'));
            setSlider('.pivot-handle', updatePivot, stanceValue, -10, 10);
        }

        // Load Aggressiveness
        if (urlParams.has('aggressive')) {
            const aggressiveValue = parseInt(urlParams.get('aggressive'));
            setSlider('.triangle-handle', updateTriangle, aggressiveValue, 0, 13);
        }

        // Load Dynamic Responsiveness
        if (urlParams.has('dynamic')) {
            const dynamicValue = parseInt(urlParams.get('dynamic'));
            setSlider('.dynamic-handle', updateDynamic, dynamicValue, -5, 5);
        }

        // Load Roll
        if (urlParams.has('roll')) {
            const rollValue = parseInt(urlParams.get('roll'));
            setSlider('.roll-handle', updateRoll, rollValue, -5, 5);
        }

        // Load Yaw Mix Rate
        if (urlParams.has('yaw')) {
            const yawValue = parseInt(urlParams.get('yaw'));
            setSlider('.yaw-handle', updateYaw, yawValue, -5, 5);
        }

        // Load Zone Engagement
        if (urlParams.has('zone')) {
            const zoneValue = urlParams.get('zone');
            if (zoneValue === 'dual-zone' || zoneValue === 'single-zone') {
                selectZone(zoneValue);
            }
        }
    }
});
