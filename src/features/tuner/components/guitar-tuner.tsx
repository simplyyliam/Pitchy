import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useArduinoSerial } from "@/hooks/use-arduino-serial";
import {
  formatCents,
  formatFrequency,
  getGuitarTuningResult,
  getTuningInstruction,
} from "@/lib/music/notes";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import { useGuitarTuner } from "../hooks/use-guitar-tuner";
import { StringTargets } from "./string-targets";
import { TuningMeter } from "./tuning-meter";
import { useGuitar } from "@/store/useGuitar";

export function GuitarTuner() {
  const {
    error,
    isListening,
    monitorVolume,
    pitch,
    startListening,
    stopListening,
    updateMonitorVolume,
  } = useGuitarTuner();
  const {
    connected: arduinoConnected,
    connectArduino,
    disconnectArduino,
    error: arduinoError,
    sendToArduino,
  } = useArduinoSerial();

  const setStoredPitch = useGuitar((state) => state.setPitch);

  const tuningResult = useMemo(
    () => (pitch ? getGuitarTuningResult(pitch.frequency) : null),
    [pitch],
  );

  useEffect(() => {
    setStoredPitch(tuningResult?.string.note ?? "-");
  }, [setStoredPitch, tuningResult]);

  useEffect(() => {
    const note = tuningResult?.string.note;

    if (!arduinoConnected || !note) {
      return;
    }

    sendToArduino(note);
  }, [arduinoConnected, sendToArduino, tuningResult?.string.note]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 text-foreground">
      <section className="flex w-full max-w-xl flex-col gap-6 rounded-3xl bg-card p-6 shadow-[0_24px_80px_oklch(0_0_0/0.12)]">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Standard guitar tuning
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Guitar pitch tuner
          </h1>
          <p className="text-sm text-muted-foreground">
            Play one open string. The tuner shows whether to tighten or loosen it.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted p-6 text-center">
          <div className="text-sm font-medium text-muted-foreground">
            Closest string
          </div>
          <div className="text-7xl font-semibold tracking-tight tabular-nums">
            {tuningResult?.string.note ?? "—"}
          </div>
          <div className="min-h-6 text-sm font-medium">
            {getTuningInstruction(tuningResult)}
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {tuningResult
              ? `${formatFrequency(tuningResult.measuredFrequency)} · ${formatCents(tuningResult.cents)}`
              : "Waiting for a stable pitch"}
          </div>
        </div>

        <TuningMeter cents={tuningResult?.cents ?? null} />

        <StringTargets activeNote={tuningResult?.string.note ?? null} />

        <div className="flex flex-col gap-3 rounded-2xl bg-muted p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Monitor volume</span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {monitorVolume}%
            </span>
          </div>
          <Slider
            value={[monitorVolume]}
            onValueChange={updateMonitorVolume}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            This controls how loud your microphone playback is in your headphones.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-muted p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Arduino display</div>
              <div className="text-xs text-muted-foreground">
                {arduinoConnected
                  ? `Sending ${tuningResult?.string.note ?? "detected notes"}`
                  : "Connect an Arduino OLED to show the note."}
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={
                arduinoConnected ? disconnectArduino : connectArduino
              }
              className="rounded-full transition-transform active:scale-[0.96]"
            >
              {arduinoConnected ? "Disconnect" : "Connect Arduino"}
            </Button>
          </div>

          {arduinoError && (
            <p className="text-sm text-destructive" role="alert">
              {arduinoError}
            </p>
          )}
        </div>

        <Button
          variant="secondary"
          onClick={isListening ? stopListening : startListening}
          className={cn(
            "min-h-12 rounded-full transition-transform active:scale-[0.96]",
            isListening && "bg-destructive text-white hover:bg-destructive/90",
          )}
        >
          {isListening ? "Stop microphone" : "Start microphone"}
        </Button>

        {error && (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
