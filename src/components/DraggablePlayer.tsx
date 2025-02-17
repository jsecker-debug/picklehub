
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Repeat } from "lucide-react";

interface DraggablePlayerProps {
  player: string;
  gender: string;
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
  currentRotationPlayers: string[];
  restingPlayers: string[];
}

const DraggablePlayer = ({ 
  player,
  gender,
  teamType,
  courtIndex,
  rotationIndex,
  onDragStart,
  currentRotationPlayers,
  restingPlayers,
}: DraggablePlayerProps) => {
  const handleClick = (targetPlayer: string) => {
    // Create a mock drag event since we're using clicks
    const mockEvent = new Event('mock') as unknown as React.DragEvent;
    onDragStart(mockEvent, { 
      player,
      teamType,
      courtIndex,
      rotationIndex,
      targetPlayer
    });
  };

  // Filter available players based on current player's position
  const getAvailablePlayers = () => {
    const allPlayers = [...currentRotationPlayers, ...restingPlayers];
    
    // Remove duplicates and current player
    return allPlayers.filter((p, index, self) => {
      const isDuplicate = self.indexOf(p) !== index;
      const isSamePlayer = p === player;
      
      if (courtIndex === -1) {
        // If current player is resting, show all players except other resting players
        return !isDuplicate && !isSamePlayer && !restingPlayers.includes(p);
      } else {
        // If current player is on court, show all players except those on the same team
        const isOnSameTeam = courtIndex !== -1 && 
          currentRotationPlayers.indexOf(p) !== -1 && 
          teamType === 'team1' ? 
          currentRotationPlayers.slice(0, 2).includes(p) : 
          currentRotationPlayers.slice(2).includes(p);
        
        return !isDuplicate && !isSamePlayer && !isOnSameTeam;
      }
    });
  };

  const availablePlayers = getAvailablePlayers();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer select-none hover:bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1">
              <span>{player}</span>
              <span className="text-xs text-gray-500">({gender})</span>
              <Repeat className="h-3 w-3 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-white z-50"
              align="end"
            >
              {availablePlayers.map((p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => handleClick(p)}
                  className="flex items-center gap-2"
                >
                  <span>{p}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to swap with another player</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DraggablePlayer;
