import { GuitarTuner } from "@/features/tuner/components/guitar-tuner";
import { Link } from "react-router-dom";

export default function Tuner() {
  return (
    <div className="flex flex-col gap-2.5 items-center justify-center">
      <GuitarTuner />
      <Link className="absolute bottom-5" to="/encoder">Encoder</Link>
    </div>
  );
}

export { Tuner };
