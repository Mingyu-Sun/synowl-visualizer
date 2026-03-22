import {extractFeatures} from './extractor.js';
import {visualize} from "./visualizer.js";
import {initialState, smoothFeatures} from "./states.js";

const state = {...initialState};
const fftSize = 2048;

let frequencyData = new Uint8Array(fftSize / 2);

let isCapturing = false;
let stream = null;
let audioContext = null;
let analyser = null;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const loop = () => {
    if (isCapturing) {
        // --- ACTIVE MODE ---
        analyser.getByteFrequencyData(frequencyData);
    } else {
        // --- STANDBY MODE ---
        for (let i = 0; i < frequencyData.length; i++) {
            frequencyData[i] *= 0.9;
        }
    }

    const features = isCapturing ? extractFeatures(frequencyData, audioContext.sampleRate, fftSize, state.lastEnergy) : null;

    smoothFeatures(state, features, isCapturing);
    visualize(frequencyData, ctx, state, canvas.width, canvas.height);
    requestAnimationFrame(loop);
}

loop();


const toggleCapture = async (btn) => {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!isCapturing) {
        // --- START CAPTURE ---
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({audio: true, video: true});
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();

            const source = audioContext.createMediaStreamSource(stream);

            // Default parameters
            analyser.fftSize = fftSize;
            analyser.minDecibels = -85;
            analyser.maxDecibels = -25;
            analyser.smoothingTimeConstant = 0.8;

            source.connect(analyser);

            frequencyData = new Uint8Array(analyser.frequencyBinCount);

            btn.innerText = 'Stop Capture';
            isCapturing = true;

            stream.getTracks()[0].onended = () => {
                if (isCapturing) toggleCapture(btn);
            };

        } catch (err) {
            console.error('ERROR:', err);
        }
    } else {
        // --- STOP CAPTURE ---
        if (stream) stream.getTracks().forEach(track => track.stop());
        if (audioContext) await audioContext.close();

        btn.innerText = 'Start Capture';
        isCapturing = false;

        analyser = null;
        audioContext = null;
    }
}

const toggleBtn = document.getElementById('toggleBtn');
toggleBtn.addEventListener('click', () => {
    toggleCapture(toggleBtn);
});
