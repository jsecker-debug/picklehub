
import DraggablePlayer from "../DraggablePlayer";

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
  }) => void;
  allPlayers: { name: string; gender: string }[];
  playerGenders: { [key: string]: string };
}

const TeamDisplay = ({
  label,
  players,
  teamType,
  courtIndex,
  rotationIndex,
  onDragStart,
  allPlayers,
  playerGenders,
}: TeamDisplayProps) => {
  return (
    <div className="flex justify-between items-center p-2 rounded border border-transparent hover:border-gray-200">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="font-medium space-x-2">
        {players.map((player, playerIdx) => (
          <DraggablePlayer
            key={playerIdx}
            player={player}
            gender={playerGenders[player] || 'M'}
            teamType={teamType}
            courtIndex={courtIndex}
            rotationIndex={rotationIndex}
            onDragStart={onDragStart}
            allPlayers={allPlayers}
          />
        ))}
      </span>
    </div>
  );
};

export default TeamDisplay;
