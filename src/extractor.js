import {TUNING} from "./constants.js";

export const extractFeatures = (dataArray, sampleRate, fftSize, lastEnergy) => {
    let totalNorm = 0;
    let bassNorm = 0;
    let weightedFreq = 0;
    let logSum = 0;
    let count = 0;

    const binWidth = sampleRate / fftSize;
    const bassMaxBin = Math.floor(TUNING.bassThreshold / binWidth);

    for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i];
        if (val === 0) continue;

        const norm = val / 255; // Normalize 0-255 to 0.0-1.0

        totalNorm += norm;
        if (i <= bassMaxBin) bassNorm += norm;

        weightedFreq += (i * binWidth) * norm;
        logSum += Math.log(norm);
        count++;
    }

    const currentEnergy = count > 0 ? totalNorm / count : 0;

    const arithMean = currentEnergy;
    const geoMean = count > 0 ? Math.exp(logSum / count) : 0;
    const flatness = arithMean > 0 ? geoMean / arithMean : 0;

    const isOnset = (currentEnergy - lastEnergy) > TUNING.onsetThreshold;

    return {
        energy: currentEnergy,
        bass: count > 0 ? bassNorm / (bassMaxBin + 1) : 0,
        centroid: totalNorm > 0 ? weightedFreq / totalNorm : 0,
        flatness,
        isOnset
    };
};
