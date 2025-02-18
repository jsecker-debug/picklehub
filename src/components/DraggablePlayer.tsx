
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
  court: { team1: string[]; team2: string[] };
  resters: string[];
}

const DraggablePlayer = ({
  player,
  index,
  teamType,
  courtIndex,
  rotationIndex,
  onSwapPlayers,
  allPlayers,
  court,
  resters
}: DraggablePlayerProps) => {
  const getSwappablePlayers = () => {
    // If the player is on a team
    if (teamType === 'team1' || teamType === 'team2') {
      const currentTeam = court[teamType];
      // Get all players except the current player and their teammate
      return allPlayers.filter(p => 
        p !== player && 
        !currentTeam.includes(p)
      );
    }
    // If the player is resting
    else {
      // Get all players except the current player and other resting players
      return allPlayers.filter(p => 
        p !== player && 
        !resters.includes(p)
      );
    }
  };

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
              {getSwappablePlayers().map((targetPlayer) => (
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
