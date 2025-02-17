
import { toast } from "sonner";
import { Rotation } from "@/types/scheduler";
import { validateSwap, findPlayerPosition } from "./validationService";
import { performSwap } from "./swapService";
import { updateRotationInDatabase } from "./databaseService";

export { updateRotationInDatabase } from "./databaseService";

export const handlePlayerSwap = (
  selectedPlayer: string,
  targetTeamType: 'team1' | 'team2',
  targetCourtIndex: number,
  targetRotation: Rotation,
  specifiedTargetPlayer?: string
): Rotation | null => {
  if (!specifiedTargetPlayer) {
    toast.error("No target player specified for swap");
    return null;
  }

  // Find source position
  const sourcePosition = findPlayerPosition(selectedPlayer, targetRotation);
  if (!sourcePosition) {
    toast.error("Could not find selected player's position");
    return null;
  }

  // Determine target position
  const targetPosition = targetCourtIndex === -1
    ? { isResting: true }
    : { isResting: false, courtIndex: targetCourtIndex, teamType: targetTeamType };

  // Validate the swap
  if (!validateSwap(selectedPlayer, specifiedTargetPlayer, sourcePosition, targetPosition, targetRotation)) {
    return null;
  }

  // Perform the swap
  return performSwap(selectedPlayer, specifiedTargetPlayer, sourcePosition, targetPosition, targetRotation);
};
