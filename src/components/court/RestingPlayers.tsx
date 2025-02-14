
import { PlayerData } from "@/types/court-display";

interface RestingPlayersProps {
  resters: string[];
  players: { [key: string]: PlayerData };
}

const RestingPlayers = ({ resters, players }: RestingPlayersProps) => {
  if (resters.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-600">Resting:</span>{" "}
      <span>
        {resters.map((player, idx) => (
          <span key={idx} className="inline-flex items-center gap-1">
            {player}
            <span className="text-xs text-gray-500">({players[player]?.gender || 'M'})</span>
            {idx < resters.length - 1 ? ", " : ""}
          </span>
        ))}
      </span>
    </div>
  );
};

export default RestingPlayers;
