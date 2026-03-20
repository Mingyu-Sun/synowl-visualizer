import {extractFeatures} from './extractor.js';
import {visualize} from "./visualizer.js";
import {initialState, smoothFeatures} from "./states.js";

const init = async () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const stream = await navigator.mediaDevices.getDisplayMedia({audio: true, video: true});
    const audioContext = new AudioContext();
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

    function loop() {
        analyser.getByteFrequencyData(frequencyData);

        const features = extractFeatures(frequencyData, audioContext.sampleRate, analyser.fftSize, state.lastEnergy);
        smoothFeatures(state, features);
        visualize(frequencyData, ctx, state, canvas.width, canvas.height);
        requestAnimationFrame(loop);
    }

    loop();
}

document.getElementById('startBtn').addEventListener('click', init);
