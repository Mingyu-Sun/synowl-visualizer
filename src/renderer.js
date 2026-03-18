async function startCapture() {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            audio: true
        });

        const audioContext = new AudioContext();

        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();
        source.connect(analyzer);

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);


        function draw() {
            requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);

            // Clear the canvas
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw bars
            const barWidth = (canvas.width / dataArray.length) * 2;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                const hue = (i / dataArray.length) * 360;
                ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.8)`;
                ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 1, barHeight);

                x += barWidth;
            }
        }

        draw();

    } catch (err) {
        console.error("ERROR:", err);
    }
}

document.getElementById('startBtn').addEventListener('click', startCapture);
