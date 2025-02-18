
import { PlayerData } from "@/types/court-display";
import { Court } from "@/types/scheduler";
import DraggablePlayer from "../DraggablePlayer";
import { SwapData } from "@/types/court-display";

interface RestingPlayersProps {
  resters: string[];
  players: { [key: string]: PlayerData };
  rotationIndex: number;
  onSwapPlayers: (data: SwapData) => void;
  allCourts: Court[];
  allPlayers: string[];
}

const RestingPlayers = ({ 
  resters, 
  players,
  rotationIndex,
  onSwapPlayers,
  allCourts,
  allPlayers,
}: RestingPlayersProps) => {
  if (resters.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-600">Resting:</span>{" "}
      <span className="space-x-2">
        {resters.map((player, idx) => (
          <DraggablePlayer
            key={idx}
            player={player}
            index={idx}
            teamType="team1"
            courtIndex={-1}
            rotationIndex={rotationIndex}
            onSwapPlayers={onSwapPlayers}
            allPlayers={allPlayers}
          />
        ))}
      </span>
    </div>
  );
};

export default RestingPlayers;
