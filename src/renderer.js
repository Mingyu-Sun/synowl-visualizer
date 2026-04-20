import {extractFeatures} from './extractor.js';
import {visualize} from "./visualizer.js";
import {defaultConfig, initialState, smoothFeatures} from "./states.js";
import {VISUALIZATION_MODES, COLOR_SCHEMES} from './constants.js';

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
const errorOverlay = document.getElementById('error-overlay');

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
        for (let i = 0; i < frequencyData.length; i++) {
            frequencyData[i] *= 0.9;
        }
        timeDomainData.fill(128);
    }

    const features = isCapturing
        ? extractFeatures(frequencyData, audioContext.sampleRate, fftSize, state.lastEnergy)
        : null;

    smoothFeatures(state, features, isCapturing, config);
    visualize(frequencyData, ctx, state, canvas.width, canvas.height, config, timeDomainData);
    requestAnimationFrame(loop);
};

let errorTimer = null;
const showError = (message) => {
    errorOverlay.textContent = message;
    errorOverlay.classList.add('visible');
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => errorOverlay.classList.remove('visible'), 3000);
};

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
            console.error('Capture error:', err);
            if (err.name === 'NotAllowedError') {
                showError('Permission denied');
            } else if (err.name === 'NotFoundError') {
                showError('No audio source found');
            } else {
                showError('Capture failed');
            }
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
};

window.electronAPI.onToggleCapture(() => {
    toggleCapture(toggleBtn);
});

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.electronAPI.showContextMenu();
});

const toggleBtn = document.getElementById('toggleBtn');
toggleBtn.addEventListener('click', () => toggleCapture(toggleBtn));

window.addEventListener('keydown', async (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            await toggleCapture(toggleBtn);
            break;

        case 'KeyS':
        case 'Escape':
            window.electronAPI.openSettings();
            break;

        case 'KeyM': {
            const cur = VISUALIZATION_MODES.indexOf(config.visualizationMode);
            const next = VISUALIZATION_MODES[(cur + 1) % VISUALIZATION_MODES.length];
            await window.electronAPI.updateSettings({visualizationMode: next});
            break;
        }

        case 'KeyC': {
            const cur = COLOR_SCHEMES.indexOf(config.colorScheme);
            const next = COLOR_SCHEMES[(cur + 1) % COLOR_SCHEMES.length];
            await window.electronAPI.updateSettings({colorScheme: next});
            break;
        }

        case 'Digit1':
            await window.electronAPI.updateSettings({visualizationMode: 'radial'});
            break;
        case 'Digit2':
            await window.electronAPI.updateSettings({visualizationMode: 'waveform'});
            break;
        case 'Digit3':
            await window.electronAPI.updateSettings({visualizationMode: 'spectrum'});
            break;
        case 'Digit4':
            await window.electronAPI.updateSettings({visualizationMode: 'particles'});
            break;
    }
});
