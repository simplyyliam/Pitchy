import { cn } from "@/lib/utils";

type TuningMeterProps = {
  cents: number | null;
};

export function TuningMeter({ cents }: TuningMeterProps) {
  const clampedCents = Math.max(-50, Math.min(50, cents ?? 0));
  const markerPosition = ((clampedCents + 50) / 100) * 100;
  const isInTune = cents !== null && Math.abs(cents) <= 5;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative h-4 rounded-full bg-muted shadow-inner">
        <div className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-foreground/30" />
        <div
          className={cn(
            "absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm transition-[left,background-color]",
            isInTune ? "bg-primary" : "bg-foreground",
          )}
          style={{ left: `${markerPosition}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Flat</span>
        <span>In tune</span>
        <span>Sharp</span>
      </div>
    </div>
  );
}
