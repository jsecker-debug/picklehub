
import { useRef } from "react";

interface DraggablePlayerProps {
  player: string;
  teamType: 'team1' | 'team2';
  courtIndex: number;
  rotationIndex: number;
  onDragStart: (e: React.DragEvent, data: { 
    player: string; 
    teamType: 'team1' | 'team2';
    courtIndex: number;
    rotationIndex: number;
  }) => void;
}

const DraggablePlayer = ({ 
  player, 
  teamType, 
  courtIndex, 
  rotationIndex,
  onDragStart 
}: DraggablePlayerProps) => {
  const dragRef = useRef<HTMLSpanElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, { player, teamType, courtIndex, rotationIndex });
  };

  return (
    <span
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      className="cursor-move select-none hover:bg-gray-100 px-2 py-1 rounded"
    >
      {player}
    </span>
  );
};

export default DraggablePlayer;
