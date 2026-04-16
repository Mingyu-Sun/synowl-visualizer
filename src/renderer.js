import {extractFeatures} from './extractor.js';
import {visualize} from "./visualizer.js";
import {defaultConfig, initialState, smoothFeatures} from "./states.js";

const state = {...initialState};
let config = {...defaultConfig};

let fftSize = 2048;
let frequencyData = new Uint8Array(fftSize / 2);
let timeDomainData = new Uint8Array(fftSize / 2);

let isCapturing = false;
let stream = null;
let audioContext = null;
let analyser = null;
let source = null;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// --- Settings ---
const applySettings = (settings) => {
    config = {
        energySmoothing: settings.energySmoothing,
        bassSmoothing: settings.bassSmoothing,
        colorScheme: settings.colorScheme,
        baseHue: settings.baseHue,
        visualizationMode: settings.visualizationMode,
    };

    if (analyser) {
        if (settings.fftSize !== fftSize) {
            fftSize = settings.fftSize;
            analyser.fftSize = fftSize;
            frequencyData = new Uint8Array(analyser.frequencyBinCount);
            timeDomainData = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.minDecibels = settings.minDecibels;
        analyser.maxDecibels = settings.maxDecibels;
        analyser.smoothingTimeConstant = settings.smoothingTimeConstant;
    } else {
        fftSize = settings.fftSize;
        frequencyData = new Uint8Array(fftSize / 2);
        timeDomainData = new Uint8Array(fftSize / 2);
    }

    if (canvas.width !== settings.windowSize) {
        canvas.width = settings.windowSize;
        canvas.height = settings.windowSize;
    }
};

window.electronAPI.getSettings().then((settings) => {
    applySettings(settings);
    loop();
});

window.electronAPI.onSettingsChanged((settings) => {
    applySettings(settings);
});

const loop = () => {
    if (isCapturing) {
        analyser.getByteFrequencyData(frequencyData);
        analyser.getByteTimeDomainData(timeDomainData);
    } else {
        // Decay
        for (let i = 0; i < frequencyData.length; i++) {
            frequencyData[i] *= 0.9;
        }
        for (let i = 0; i < timeDomainData.length; i++) {
            timeDomainData[i] += (128 - timeDomainData[i]) * 0.1;
        }
    }

    const features = isCapturing ? extractFeatures(frequencyData, audioContext.sampleRate, fftSize, state.lastEnergy) : null;

    smoothFeatures(state, features, isCapturing, config);
    visualize(frequencyData, ctx, state, canvas.width, canvas.height, config, timeDomainData);
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
            timeDomainData = new Uint8Array(analyser.frequencyBinCount);

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
