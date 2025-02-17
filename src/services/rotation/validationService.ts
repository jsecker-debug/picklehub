
import { toast } from "sonner";
import { Rotation } from "@/types/scheduler";
import { PlayerPosition } from "./types";

export const validateSwap = (
  selectedPlayer: string,
  targetPlayer: string,
  sourcePosition: PlayerPosition,
  targetPosition: PlayerPosition,
  rotation: Rotation
): boolean => {
  // Cannot swap player with themselves
  if (targetPlayer === selectedPlayer) {
    toast.error("Cannot swap a player with themselves");
    return false;
  }

  // If target is on court, validate court position
  if (!targetPosition.isResting) {
    const targetCourt = rotation.courts[targetPosition.courtIndex];
    if (!targetCourt) {
      toast.error("Invalid court selected");
      return false;
    }

    // Verify target player is in specified position
    if (!targetCourt[targetPosition.teamType]?.includes(targetPlayer)) {
      toast.error("Target player not found in specified position");
      return false;
    }

    // Prevent same player appearing twice on a team (if source is not resting)
    if (!sourcePosition.isResting &&
        sourcePosition.courtIndex === targetPosition.courtIndex &&
        sourcePosition.teamType === targetPosition.teamType) {
      toast.error("Cannot swap player with their own position");
      return false;
    }
  }

  // For resting target players, just verify they exist in resters
  if (targetPosition.isResting && !rotation.resters.includes(targetPlayer)) {
    toast.error("Target player not found in resting position");
    return false;
  }

  return true;
};

export const findPlayerPosition = (
  player: string,
  rotation: Rotation
): PlayerPosition | null => {
  // Check if player is resting
  if (rotation.resters.includes(player)) {
    return { isResting: true };
  }

  // Find player in courts
  for (let i = 0; i < rotation.courts.length; i++) {
    const court = rotation.courts[i];
    if (court.team1.includes(player)) {
      return { isResting: false, courtIndex: i, teamType: 'team1' };
    }
    if (court.team2.includes(player)) {
      return { isResting: false, courtIndex: i, teamType: 'team2' };
    }
  }

  return null;
};
