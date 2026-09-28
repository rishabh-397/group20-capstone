import { useData } from "../api/DataProvider.jsx";
import { CONFIG } from "../lib/config.js";

export default function DemoBanner() {
  const { connection } = useData();
  if (connection !== "demo" && connection !== "down") return null;
  return (
    <div className="banner">
      <div>
        <b>Showing sample data.</b> The page couldn't reach <code>{CONFIG.apiBase}</code>, so every figure below is
        placeholder. Start the FastAPI server and press “Refresh data” — the layout and fields are the real ones.
      </div>
    </div>
  );
}
