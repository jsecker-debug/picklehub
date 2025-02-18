
import { Draggable } from "react-beautiful-dnd";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SwapData } from "@/types/court-display";

interface DraggablePlayerProps {
  player: string;
  index: number;
  teamType: 'team1' | 'team2';
  courtIndex: number;
  rotationIndex: number;
  onSwapPlayers: (data: SwapData) => void;
  allPlayers: string[];
}

const DraggablePlayer = ({
  player,
  index,
  teamType,
  courtIndex,
  rotationIndex,
  onSwapPlayers,
  allPlayers
}: DraggablePlayerProps) => {
  return (
    <Draggable draggableId={`${player}-${courtIndex}-${teamType}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start font-normal hover:bg-gray-100"
              >
                {player}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
              {allPlayers
                .filter(p => p !== player)
                .map((targetPlayer) => (
                  <DropdownMenuItem
                    key={targetPlayer}
                    onClick={() => onSwapPlayers({
                      player,
                      teamType,
                      courtIndex,
                      rotationIndex,
                      targetPlayer
                    })}
                  >
                    Swap with {targetPlayer}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Draggable>
  );
};

export default DraggablePlayer;
