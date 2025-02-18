
import { Draggable } from "react-beautiful-dnd";
import DraggablePlayer from "@/components/DraggablePlayer";
import { SwapData } from "@/types/court-display";
import { Court } from "@/types/scheduler";

interface TeamDisplayProps {
  label: string;
  players: string[];
  teamType: 'team1' | 'team2';
  courtIndex: number;
  rotationIndex: number;
  onSwapPlayers: (data: SwapData) => void;
  allCourts: Court[];
  playerGenders: { [key: string]: string };
  restingPlayers: string[];
  allPlayers: string[];
}

const TeamDisplay = ({
  label,
  players,
  teamType,
  courtIndex,
  rotationIndex,
  onSwapPlayers,
  allCourts,
  restingPlayers,
  allPlayers
}: TeamDisplayProps) => {
  const currentCourt = allCourts[courtIndex];

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">{label}:</h4>
      <div className="space-y-2">
        {players.map((player, index) => (
          <DraggablePlayer
            key={player}
            player={player}
            index={index}
            teamType={teamType}
            courtIndex={courtIndex}
            rotationIndex={rotationIndex}
            onSwapPlayers={onSwapPlayers}
            allPlayers={allPlayers}
            court={currentCourt}
            resters={restingPlayers}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamDisplay;
