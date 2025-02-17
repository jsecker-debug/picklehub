
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

  // Verify source player position
  if (sourcePosition.isResting) {
    if (!rotation.resters.includes(selectedPlayer)) {
      toast.error("Selected player not found in resting position");
      return false;
    }
  } else {
    const sourceCourt = rotation.courts[sourcePosition.courtIndex!];
    if (!sourceCourt[sourcePosition.teamType!].includes(selectedPlayer)) {
      toast.error("Selected player not found in specified position");
      return false;
    }
  }

  // Verify target player position
  if (targetPosition.isResting) {
    if (!rotation.resters.includes(targetPlayer)) {
      toast.error("Target player not found in resting position");
      return false;
    }
  } else {
    const targetCourt = rotation.courts[targetPosition.courtIndex!];
    if (!targetCourt) {
      toast.error("Invalid court selected");
      return false;
    }
    if (!targetCourt[targetPosition.teamType!].includes(targetPlayer)) {
      toast.error("Target player not found in specified position");
      return false;
    }
  }

  // Prevent same player appearing twice on a team
  if (!sourcePosition.isResting && !targetPosition.isResting &&
      sourcePosition.courtIndex === targetPosition.courtIndex &&
      sourcePosition.teamType === targetPosition.teamType) {
    toast.error("Cannot swap player with their own position");
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
