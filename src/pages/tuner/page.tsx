import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useEffect, useRef, useState } from "react";

const MAX_MONITOR_GAIN = 2;

export function Tuner() {
  const [isListening, setIsListening] = useState(false);
  const [monitorVolume, setMonitorVolume] = useState(50);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const monitorGainRef = useRef<GainNode | null>(null);

  function updateMonitorVolume(value: number | readonly number[]) {
    const nextVolume = Array.isArray(value) ? value[0] ?? 0 : value;

    setMonitorVolume(nextVolume);

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

  async function startMicrophone() {
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

      analyser.fftSize = 2048;
      monitorGain.gain.value = (monitorVolume / 100) * MAX_MONITOR_GAIN;

      source.connect(analyser);
      analyser.connect(monitorGain);
      monitorGain.connect(audioContext.destination);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      monitorGainRef.current = monitorGain;

      setIsListening(true);
    } catch (error) {
      console.error(error);
      setError("Could not access the microphone.");
    }
  }

  function stopMicrophone() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();

    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    monitorGainRef.current = null;

    setIsListening(false);
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <Button variant='secondary' onClick={isListening ? stopMicrophone : startMicrophone} className={`px-5 py-7 rounded-full ${isListening ? "bg-red-100 text-red-600 hover:bg-red-200" : ""}`}>
        {isListening ? "Stop microphone" : "Start microphone"}
      </Button>

      {isListening && (
        <div className="mt-6 flex w-full max-w-xs items-center justify-center">
          <Slider
            value={[monitorVolume]}
            onValueChange={updateMonitorVolume}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}
