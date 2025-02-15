
import { PlayerData } from "@/types/court-display";
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
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-600">Resting:</span>{" "}
      <span className="space-x-2">
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
      </span>
    </div>
  );
};

export default RestingPlayers;
