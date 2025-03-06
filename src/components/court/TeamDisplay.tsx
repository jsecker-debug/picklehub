
import DraggablePlayer from "../DraggablePlayer";
import { Court } from "@/types/scheduler";
import { PlayerData } from "@/types/court-display";

interface TeamDisplayProps {
  label: string;
  players: string[];
  teamType: 'team1' | 'team2';
  courtIndex: number;
  rotationIndex: number;
  onDragStart: (e: React.DragEvent, data: { 
    player: string; 
    teamType: 'team1' | 'team2';
    courtIndex: number;
    rotationIndex: number;
    targetPlayer?: string;
  }) => void;
  allCourts: Court[];
  playerGenders: { [key: string]: PlayerData };
  restingPlayers: string[];
}

const TeamDisplay = ({
  label,
  players,
  teamType,
  courtIndex,
  rotationIndex,
  onDragStart,
  allCourts,
  playerGenders,
  restingPlayers,
}: TeamDisplayProps) => {
  // Get all players from all courts in the current rotation
  const allRotationPlayers = allCourts.reduce((acc: string[], court) => {
    return [...acc, ...court.team1, ...court.team2];
  }, []);

  // Determine background color based on team type
  const getBgColor = () => {
    return teamType === 'team1' 
      ? 'bg-blue-100 hover:bg-blue-200' 
      : 'bg-green-100 hover:bg-green-200';
  };

  return (
    <div className={`flex flex-col p-4 rounded-md border ${getBgColor()} shadow-sm`}>
      <span className="text-xl font-semibold text-gray-700 mb-3">{label}:</span>
      <div className="flex flex-wrap gap-3 justify-end">
        {players.map((player, playerIdx) => (
          <DraggablePlayer
            key={playerIdx}
            player={player}
            gender={playerGenders[player]?.gender || 'M'}
            teamType={teamType}
            courtIndex={courtIndex}
            rotationIndex={rotationIndex}
            onDragStart={onDragStart}
            currentRotationPlayers={allRotationPlayers}
            restingPlayers={restingPlayers}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamDisplay;
