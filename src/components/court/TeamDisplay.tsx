
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
      ? 'bg-blue-200 hover:bg-blue-300' 
      : 'bg-green-200 hover:bg-green-300';
  };

  return (
    <div className={`flex flex-col p-5 rounded-md border-2 ${getBgColor()} shadow-md`}>
      <span className="text-2xl font-bold text-gray-800 mb-4 text-center">{label}</span>
      <div className="flex flex-wrap gap-4 justify-center">
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
