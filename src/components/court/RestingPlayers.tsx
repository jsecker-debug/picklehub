
import { PlayerData } from "@/types/court-display";
import { Court } from "@/types/scheduler";
import DraggablePlayer from "../DraggablePlayer";

interface RestingPlayersProps {
  resters: string[];
  players: { [key: string]: PlayerData };
  rotationIndex: number;
  onDragStart: (e: React.DragEvent, data: { 
    player: string; 
    teamType: 'team1' | 'team2';
    courtIndex: number;
    rotationIndex: number;
  }) => void;
  allCourts: Court[];
}

const RestingPlayers = ({ 
  resters, 
  players,
  rotationIndex,
  onDragStart,
  allCourts,
}: RestingPlayersProps) => {
  if (resters.length === 0) return null;

  return (
    <div className="mt-6 p-5 bg-yellow-50 rounded-lg border border-yellow-200 shadow-inner">
      <h3 className="text-2xl font-semibold text-amber-700 mb-4">Resting Players:</h3>
      <div className="flex flex-wrap gap-3">
        {resters.map((player, idx) => (
          <DraggablePlayer
            key={idx}
            player={player}
            gender={players[player]?.gender || 'M'}
            teamType="team1" // Default team type for resting players
            courtIndex={-1} // Special index for resting players
            rotationIndex={rotationIndex}
            onDragStart={onDragStart}
            currentRotationPlayers={allCourts.reduce((acc, court) => [...acc, ...court.team1, ...court.team2], [])}
            restingPlayers={resters}
          />
        ))}
      </div>
    </div>
  );
};

export default RestingPlayers;
