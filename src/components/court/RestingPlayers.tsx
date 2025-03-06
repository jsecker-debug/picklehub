
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
    <div className="mt-6 p-6 bg-amber-100 rounded-lg border-2 border-amber-300 shadow-md">
      <h3 className="text-3xl font-bold text-amber-800 mb-5">Resting Players:</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
