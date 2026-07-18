export type GuitarString = {
  label: string;
  note: string;
  frequency: number;
};

export type TuningDirection = "flat" | "sharp" | "in-tune";

export type GuitarTuningResult = {
  string: GuitarString;
  cents: number;
  direction: TuningDirection;
  measuredNote: string;
  measuredFrequency: number;
};

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const STANDARD_GUITAR_TUNING: GuitarString[] = [
  { label: "6th string", note: "E2", frequency: 82.41 },
  { label: "5th string", note: "A2", frequency: 110 },
  { label: "4th string", note: "D3", frequency: 146.83 },
  { label: "3rd string", note: "G3", frequency: 196 },
  { label: "2nd string", note: "B3", frequency: 246.94 },
  { label: "1st string", note: "E4", frequency: 329.63 },
];

export function frequencyToNote(frequency: number) {
  const midiNote = Math.round(69 + 12 * Math.log2(frequency / 440));
  const noteName = NOTE_NAMES[((midiNote % 12) + 12) % 12];
  const octave = Math.floor(midiNote / 12) - 1;

  return `${noteName}${octave}`;
}

export function getCentsDifference(frequency: number, targetFrequency: number) {
  return 1200 * Math.log2(frequency / targetFrequency);
}

export function getClosestGuitarString(frequency: number) {
  return STANDARD_GUITAR_TUNING.reduce((closest, string) => {
    const closestDistance = Math.abs(getCentsDifference(frequency, closest.frequency));
    const stringDistance = Math.abs(getCentsDifference(frequency, string.frequency));

    return stringDistance < closestDistance ? string : closest;
  });
}

export function getGuitarTuningResult(
  frequency: number,
): GuitarTuningResult {
  const string = getClosestGuitarString(frequency);
  const cents = getCentsDifference(frequency, string.frequency);
  const absCents = Math.abs(cents);

  return {
    string,
    cents,
    direction: absCents <= 5 ? "in-tune" : cents < 0 ? "flat" : "sharp",
    measuredNote: frequencyToNote(frequency),
    measuredFrequency: frequency,
  };
}

export function formatFrequency(frequency: number) {
  return `${frequency.toFixed(1)} Hz`;
}

export function formatCents(cents: number) {
  const rounded = Math.round(cents);

  if (rounded > 0) {
    return `+${rounded} cents`;
  }

  return `${rounded} cents`;
}

export function getTuningInstruction(result: GuitarTuningResult | null) {
  if (!result) {
    return "Play one open string clearly.";
  }

  if (result.direction === "in-tune") {
    return `${result.string.note} is in tune.`;
  }

  if (result.direction === "flat") {
    return `Too low — tighten the ${result.string.note} string.`;
  }

  return `Too high — loosen the ${result.string.note} string.`;
}
