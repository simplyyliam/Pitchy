import { STANDARD_GUITAR_TUNING } from "@/lib/music/notes";
import { cn } from "@/lib/utils";

type StringTargetsProps = {
  activeNote: string | null;
};

export function StringTargets({ activeNote }: StringTargetsProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
      {STANDARD_GUITAR_TUNING.map((string) => (
        <div
          key={`${string.label}-${string.note}`}
          className={cn(
            "rounded-xl bg-muted px-3 py-2 text-center transition-[background-color,color]",
            activeNote === string.note && "bg-primary text-primary-foreground",
          )}
        >
          <div className="text-lg font-semibold tabular-nums">{string.note}</div>
          <div className="text-xs opacity-75">{string.label}</div>
        </div>
      ))}
    </div>
  );
}
