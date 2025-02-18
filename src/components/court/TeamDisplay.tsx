
import { Droppable } from "react-beautiful-dnd";
import DraggablePlayer from "../DraggablePlayer";
import { Court } from "@/types/scheduler";
import { SwapData } from "@/types/court-display";

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
  allPlayers,
}: TeamDisplayProps) => {
  return (
    <div className="flex justify-between items-center p-2 rounded border border-transparent hover:border-gray-200">
      <span className="text-sm text-gray-600">{label}:</span>
      <Droppable droppableId={`team-${teamType}-${courtIndex}-${rotationIndex}`}>
        {(provided) => (
          <span 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="font-medium space-x-2"
          >
            {players.map((player, playerIdx) => (
              <DraggablePlayer
                key={playerIdx}
                player={player}
                index={playerIdx}
                teamType={teamType}
                courtIndex={courtIndex}
                rotationIndex={rotationIndex}
                onSwapPlayers={onSwapPlayers}
                allPlayers={allPlayers}
              />
            ))}
            {provided.placeholder}
          </span>
        )}
      </Droppable>
    </div>
  );
};

export default TeamDisplay;
