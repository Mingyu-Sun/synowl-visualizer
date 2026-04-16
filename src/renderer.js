import {extractFeatures} from './extractor.js';
import {visualize} from "./visualizer.js";
import {defaultConfig, initialState, smoothFeatures} from "./states.js";

const state = {...initialState};
let config = {...defaultConfig};

let fftSize = 2048;
let frequencyData = new Uint8Array(fftSize / 2);

let isCapturing = false;
let stream = null;
let audioContext = null;
let analyser = null;
let source = null;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// --- Settings integration ---
const applySettings = (settings) => {
    config = {
        energySmoothing: settings.energySmoothing,
        bassSmoothing: settings.bassSmoothing,
        colorScheme: settings.colorScheme,
        baseHue: settings.baseHue,
    };

    // Apply audio analyser settings
    if (analyser) {
        if (settings.fftSize !== fftSize) {
            fftSize = settings.fftSize;
            analyser.fftSize = fftSize;
            frequencyData = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.minDecibels = settings.minDecibels;
        analyser.maxDecibels = settings.maxDecibels;
        analyser.smoothingTimeConstant = settings.smoothingTimeConstant;
    } else {
        fftSize = settings.fftSize;
        frequencyData = new Uint8Array(fftSize / 2);
    }

    // Update canvas size
    if (canvas.width !== settings.windowSize) {
        canvas.width = settings.windowSize;
        canvas.height = settings.windowSize;
    }
};

// Load initial settings, then start the loop
window.electronAPI.getSettings().then((settings) => {
    applySettings(settings);
    loop();
});

// React to live settings changes from the settings window
window.electronAPI.onSettingsChanged((settings) => {
    applySettings(settings);
});

const loop = () => {
    if (isCapturing) {
        analyser.getByteFrequencyData(frequencyData);
    } else {
        for (let i = 0; i < frequencyData.length; i++) {
            frequencyData[i] *= 0.9;
        }
    }

    const features = isCapturing ? extractFeatures(frequencyData, audioContext.sampleRate, fftSize, state.lastEnergy) : null;

    smoothFeatures(state, features, isCapturing, config);
    visualize(frequencyData, ctx, state, canvas.width, canvas.height, config);
    requestAnimationFrame(loop);
}

const toggleCapture = async (btn) => {
    if (!isCapturing) {
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({audio: true, video: true});
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();

            source = audioContext.createMediaStreamSource(stream);

            analyser.fftSize = fftSize;
            analyser.minDecibels = -85;
            analyser.maxDecibels = -25;
            analyser.smoothingTimeConstant = 0.8;

            source.connect(analyser);

            frequencyData = new Uint8Array(analyser.frequencyBinCount);

            btn.classList.toggle('startIcon');
            btn.classList.toggle('pauseIcon');
            isCapturing = true;

            stream.getTracks()[0].onended = () => {
                if (isCapturing) toggleCapture(btn);
            };

        } catch (err) {
            console.error('ERROR:', err);
        }
    } else {
        if (stream) stream.getTracks().forEach(track => track.stop());
        if (audioContext) await audioContext.close();

        btn.classList.toggle('startIcon');
        btn.classList.toggle('pauseIcon');
        isCapturing = false;

        analyser = null;
        audioContext = null;
        source = null;
    }
}

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.electronAPI.showContextMenu();
});

const toggleBtn = document.getElementById('toggleBtn');
toggleBtn.addEventListener('click', () => {
    toggleCapture(toggleBtn);
});
