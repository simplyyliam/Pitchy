import { useEffect, useRef, useState } from "react";
import { detectPitch, type PitchDetectionResult } from "../lib/pitch-detection";

const ANALYSER_FFT_SIZE = 4096;
const MAX_MONITOR_GAIN = 4;

export function useGuitarTuner() {
  const [isListening, setIsListening] = useState(false);
  const [monitorVolume, setMonitorVolume] = useState(50);
  const [pitch, setPitch] = useState<PitchDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const monitorGainRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const inputBufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);

  function setGainFromVolume(nextVolume: number) {
    const audioContext = audioContextRef.current;
    const monitorGain = monitorGainRef.current;

    if (!audioContext || !monitorGain) {
      return;
    }

    monitorGain.gain.setValueAtTime(
      (nextVolume / 100) * MAX_MONITOR_GAIN,
      audioContext.currentTime,
    );
  }

  function updateMonitorVolume(value: number | readonly number[]) {
    const nextVolume = Array.isArray(value) ? value[0] ?? 0 : value;

    setMonitorVolume(nextVolume);
    setGainFromVolume(nextVolume);
  }

  async function startListening() {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioContext = new AudioContext();
      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      const monitorGain = audioContext.createGain();

      analyser.fftSize = ANALYSER_FFT_SIZE;
      monitorGain.gain.value = (monitorVolume / 100) * MAX_MONITOR_GAIN;

      source.connect(analyser);
      analyser.connect(monitorGain);
      monitorGain.connect(audioContext.destination);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      monitorGainRef.current = monitorGain;
      inputBufferRef.current = new Float32Array(
        new ArrayBuffer(analyser.fftSize * Float32Array.BYTES_PER_ELEMENT),
      );

      setIsListening(true);
      listenForPitch();
    } catch (error) {
      console.error(error);
      setError("Could not access the microphone.");
    }
  }

  function stopListening() {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();

    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    monitorGainRef.current = null;
    animationFrameRef.current = null;
    inputBufferRef.current = null;

    setPitch(null);
    setIsListening(false);
  }

  function listenForPitch() {
    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;
    const inputBuffer = inputBufferRef.current;

    if (!analyser || !audioContext || !inputBuffer) {
      return;
    }

    analyser.getFloatTimeDomainData(inputBuffer);
    setPitch(detectPitch(inputBuffer, audioContext.sampleRate));

    animationFrameRef.current = requestAnimationFrame(listenForPitch);
  }

  useEffect(() => {
    return stopListening;
  }, []);

  return {
    error,
    isListening,
    monitorVolume,
    pitch,
    startListening,
    stopListening,
    updateMonitorVolume,
  };
}
