import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-2.5 items-center justify-center w-full h-screen">
      <span>Hello Dashboard</span>
      <div className="flex items-center justify-center gap-2.5">
        <Link to="/tuner">Tuner</Link>
      </div>
    </div>
  )
}
