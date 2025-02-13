
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  }) => void;
  allPlayers: { name: string; gender: string }[];
}

const DraggablePlayer = ({ 
  player, 
  gender,
  teamType, 
  courtIndex, 
  rotationIndex,
  onDragStart,
  allPlayers 
}: DraggablePlayerProps) => {
  const [open, setOpen] = useState(false);

  const handleSwap = (targetPlayer: string) => {
    // Create a mock drag event to use the existing swap logic
    const mockEvent = new Event('mock') as unknown as React.DragEvent;
    onDragStart(mockEvent, { 
      player: targetPlayer, 
      teamType, 
      courtIndex, 
      rotationIndex 
    });
    setOpen(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger className="cursor-pointer select-none hover:bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1">
              <span>{player}</span>
              <span className="text-xs text-gray-500">({gender})</span>
              <Repeat className="h-3 w-3 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-white z-50"
              align="end"
            >
              {allPlayers
                .filter(p => p.name !== player)
                .map((p) => (
                  <DropdownMenuItem
                    key={p.name}
                    onClick={() => handleSwap(p.name)}
                    className="flex items-center gap-2"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-gray-500">({p.gender})</span>
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
