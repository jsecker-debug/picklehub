
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
        const currentTeamPlayers = courtIndex !== -1 && teamType === 'team1' 
          ? currentRotationPlayers.slice(courtIndex * 4, courtIndex * 4 + 2)  // Get team1 players for this court
          : currentRotationPlayers.slice(courtIndex * 4 + 2, courtIndex * 4 + 4);  // Get team2 players for this court
        
        return !isDuplicate && !isSamePlayer && !currentTeamPlayers.includes(p);
      }
    });
  };

  const availablePlayers = getAvailablePlayers();

  // Determine background color based on team type
  const getBgColor = () => {
    if (teamType === 'team1') return 'bg-blue-200 hover:bg-blue-300';
    if (teamType === 'team2') return 'bg-green-200 hover:bg-green-300';
    return 'bg-yellow-200 hover:bg-yellow-300';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button" 
                className={`cursor-pointer select-none px-2 sm:px-4 py-1.5 sm:py-3 rounded-lg text-base sm:text-xl font-medium shadow-sm ${getBgColor()} w-full flex flex-col items-center gap-0.5 sm:gap-1`}
              >
                <span className="text-sm sm:text-xl">{player}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm text-gray-600">({gender})</span>
                  <Repeat className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-white z-50"
              align="end"
            >
              {availablePlayers.map((p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => handleClick(p)}
                  className="flex items-center gap-2 text-sm sm:text-base"
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
