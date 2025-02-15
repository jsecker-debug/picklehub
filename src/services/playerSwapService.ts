
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Rotation } from "@/types/scheduler";

export const updateRotationInDatabase = async (
  targetRotation: Rotation,
  sessionId: string
) => {
  try {
    // Update all courts in the rotation
    for (let i = 0; i < targetRotation.courts.length; i++) {
      const court = targetRotation.courts[i];
      const { error } = await supabase
        .from('court_assignments')
        .update({
          team1_players: court.team1,
          team2_players: court.team2
        })
        .eq('rotation_id', targetRotation.id)
        .eq('court_number', i + 1);

      if (error) throw error;
    }

    // Update resters
    const { error: restersError } = await supabase
      .from('roation_resters')
      .update({
        resting_players: targetRotation.resters
      })
      .eq('rotation_id', targetRotation.id);

    if (restersError) throw restersError;

    // Update rotation flag
    const { error: rotationError } = await supabase
      .from('rotations')
      .update({ manually_modified: true })
      .eq('id', targetRotation.id);

    if (rotationError) throw rotationError;

    return true;
  } catch (error) {
    console.error('Error updating player positions:', error);
    return false;
  }
};

export const handlePlayerSwap = (
  selectedPlayer: string,
  targetTeamType: 'team1' | 'team2',
  targetCourtIndex: number,
  targetRotation: Rotation
): Rotation | null => {
  let sourceCourtIndex = -1;
  let sourceTeamType: 'team1' | 'team2' | null = null;
  let isSelectedPlayerResting = false;
  let isTargetPlayerResting = false;

  // Find the selected player's current position
  for (let cIdx = 0; cIdx < targetRotation.courts.length; cIdx++) {
    const court = targetRotation.courts[cIdx];
    if (court.team1.includes(selectedPlayer)) {
      sourceCourtIndex = cIdx;
      sourceTeamType = 'team1';
      break;
    }
    if (court.team2.includes(selectedPlayer)) {
      sourceCourtIndex = cIdx;
      sourceTeamType = 'team2';
      break;
    }
  }

  // Check if selected player is resting
  if (!sourceTeamType) {
    isSelectedPlayerResting = targetRotation.resters.includes(selectedPlayer);
  }

  // Get the target player
  let targetPlayer: string;
  if (targetCourtIndex === -1) {
    // Target is a resting player
    isTargetPlayerResting = true;
    targetPlayer = selectedPlayer; // We'll find the actual target player in resters
  } else {
    const targetCourt = targetRotation.courts[targetCourtIndex];
    targetPlayer = targetCourt[targetTeamType][0];
  }

  if (!sourceTeamType && !isSelectedPlayerResting) {
    toast.error("Could not find selected player's position in this rotation");
    return null;
  }

  // Create a deep copy of the rotation to avoid state mutations
  const updatedRotation = JSON.parse(JSON.stringify(targetRotation));

  if (isSelectedPlayerResting) {
    // Remove selected player from resters
    updatedRotation.resters = updatedRotation.resters.filter(p => p !== selectedPlayer);
    
    if (isTargetPlayerResting) {
      // Both players are in resters, no court updates needed
      updatedRotation.resters = updatedRotation.resters.filter(p => p !== targetPlayer);
      updatedRotation.resters.push(selectedPlayer);
    } else {
      // Move target player to resters and place selected player in their position
      updatedRotation.resters.push(targetPlayer);
      const targetCourt = updatedRotation.courts[targetCourtIndex];
      targetCourt[targetTeamType] = targetCourt[targetTeamType].map(p => 
        p === targetPlayer ? selectedPlayer : p
      );
    }
  } else if (sourceTeamType) {
    const sourceCourt = updatedRotation.courts[sourceCourtIndex];
    
    if (isTargetPlayerResting) {
      // Move selected player to resters and target player to court
      updatedRotation.resters = updatedRotation.resters.filter(p => p !== targetPlayer);
      sourceCourt[sourceTeamType] = sourceCourt[sourceTeamType].map(p => 
        p === selectedPlayer ? targetPlayer : p
      );
    } else {
      // Standard court-to-court swap
      const targetCourt = updatedRotation.courts[targetCourtIndex];
      sourceCourt[sourceTeamType] = sourceCourt[sourceTeamType].map(p => 
        p === selectedPlayer ? targetPlayer : p
      );
      targetCourt[targetTeamType] = targetCourt[targetTeamType].map(p => 
        p === targetPlayer ? selectedPlayer : p
      );
    }
  }

  return updatedRotation;
};
