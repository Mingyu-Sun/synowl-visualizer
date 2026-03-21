import {extractFeatures} from './extractor.js';
import {visualize} from "./visualizer.js";
import {initialState, smoothFeatures} from "./states.js";

let isCapturing = false;
let stream = null;
let audioContext = null;
let animationId = null;

const toggleCapture = async (btn) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    if (!isCapturing) {
        // --- START CAPTURE ---
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({audio: true, video: true});
            audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();

            // Default parameters
            analyser.fftSize = 2048;
            analyser.minDecibels = -85;
            analyser.maxDecibels = -25;
            analyser.smoothingTimeConstant = 0.8;

            source.connect(analyser);

            const frequencyData = new Uint8Array(analyser.frequencyBinCount);
            const state = {...initialState};

            btn.innerText = 'Stop Capture';
            btn.classList.add('active');
            isCapturing = true;

            const loop = () => {
                analyser.getByteFrequencyData(frequencyData);

                const features = extractFeatures(frequencyData, audioContext.sampleRate, analyser.fftSize, state.lastEnergy);
                smoothFeatures(state, features);
                visualize(frequencyData, ctx, state, canvas.width, canvas.height);
                animationId = requestAnimationFrame(loop);
            }

            loop();

            stream.getTracks()[0].onended = () => {
                if (isCapturing) toggleCapture(btn);
            };

        } catch (err) {
            console.error('ERROR:', err);
        }
    } else {
        // --- STOP CAPTURE ---

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        if (audioContext) {
            await audioContext.close();
            audioContext = null;
        }

        cancelAnimationFrame(animationId);

        btn.innerText = 'Start Capture';
        btn.classList.remove('active');
        isCapturing = false;
    }
}

document.getElementById('toggleBtn').addEventListener('click', () => {
    toggleCapture(toggleBtn);
});
