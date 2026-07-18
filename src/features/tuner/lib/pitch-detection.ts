export type PitchDetectionResult = {
  frequency: number;
  clarity: number;
};

const MIN_FREQUENCY = 70;
const MAX_FREQUENCY = 400;
const MIN_RMS = 0.01;
const MIN_CLARITY = 0.6;

export function detectPitch(
  buffer: ArrayLike<number>,
  sampleRate: number,
): PitchDetectionResult | null {
  const rms = getRootMeanSquare(buffer);

  if (rms < MIN_RMS) {
    return null;
  }

  const minLag = Math.floor(sampleRate / MAX_FREQUENCY);
  const maxLag = Math.floor(sampleRate / MIN_FREQUENCY);
  let bestLag = -1;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;

    for (let index = 0; index < buffer.length - lag; index += 1) {
      correlation += buffer[index] * buffer[index + lag];
    }

    correlation /= buffer.length - lag;

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (bestLag === -1) {
    return null;
  }

  const clarity = bestCorrelation / (rms * rms);

  if (clarity < MIN_CLARITY) {
    return null;
  }

  return {
    frequency: sampleRate / bestLag,
    clarity: Math.min(clarity, 1),
  };
}

function getRootMeanSquare(buffer: ArrayLike<number>) {
  let sum = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    const sample = buffer[index];

    sum += sample * sample;
  }

  return Math.sqrt(sum / buffer.length);
}
