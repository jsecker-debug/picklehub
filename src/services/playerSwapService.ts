
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Rotation } from "@/types/scheduler";

export const updateRotationInDatabase = async (
  targetRotation: Rotation,
  sessionId: string
) => {
  try {
    // Update all courts in the rotation
    const updatePromises = targetRotation.courts.map((court, i) => 
      supabase
        .from('court_assignments')
        .update({
          team1_players: court.team1,
          team2_players: court.team2
        })
        .eq('rotation_id', targetRotation.id)
        .eq('court_number', i + 1)
    );

    // Update resters
    updatePromises.push(
      supabase
        .from('roation_resters')
        .update({
          resting_players: targetRotation.resters
        })
        .eq('rotation_id', targetRotation.id)
    );

    // Update rotation flag
    updatePromises.push(
      supabase
        .from('rotations')
        .update({ manually_modified: true })
        .eq('id', targetRotation.id)
    );

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    
    // Check if any updates failed
    const hasError = results.some(result => result.error);
    if (hasError) {
      throw new Error('One or more updates failed');
    }

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
  // Create a deep copy of the rotation to avoid state mutations
  const updatedRotation = JSON.parse(JSON.stringify(targetRotation));
  
  // Find the selected player's current position
  let sourceCourtIndex = -1;
  let sourceTeamType: 'team1' | 'team2' | null = null;
  let isSelectedPlayerResting = false;

  // Check if selected player is resting
  if (updatedRotation.resters.includes(selectedPlayer)) {
    isSelectedPlayerResting = true;
  } else {
    // Find player in courts
    for (let i = 0; i < updatedRotation.courts.length; i++) {
      const court = updatedRotation.courts[i];
      if (court.team1.includes(selectedPlayer)) {
        sourceCourtIndex = i;
        sourceTeamType = 'team1';
        break;
      }
      if (court.team2.includes(selectedPlayer)) {
        sourceCourtIndex = i;
        sourceTeamType = 'team2';
        break;
      }
    }
  }

  // Get target player and validate swap
  let targetPlayer: string | null = null;
  let isTargetPlayerResting = targetCourtIndex === -1;

  if (isTargetPlayerResting) {
    // Target is a resting player
    if (updatedRotation.resters.length === 0) {
      toast.error("No resting players to swap with");
      return null;
    }
    // Get first resting player that isn't the selected player
    targetPlayer = updatedRotation.resters.find(p => p !== selectedPlayer) || null;
  } else {
    const targetCourt = updatedRotation.courts[targetCourtIndex];
    if (!targetCourt) {
      toast.error("Invalid court selected");
      return null;
    }

    // Get the player from target position
    targetPlayer = targetCourt[targetTeamType][0];

    // Prevent swapping to same team
    if (sourceCourtIndex === targetCourtIndex && sourceTeamType === targetTeamType) {
      toast.error("Cannot swap player with their own position");
      return null;
    }

    // Prevent same player appearing twice on a team
    const targetTeamPlayers = targetCourt[targetTeamType];
    if (targetTeamPlayers.includes(selectedPlayer)) {
      toast.error("Player cannot be on the same team twice");
      return null;
    }
  }

  if (!targetPlayer) {
    toast.error("No valid target player found for swap");
    return null;
  }

  // Perform the swap
  if (isSelectedPlayerResting) {
    // Remove selected player from resters
    updatedRotation.resters = updatedRotation.resters.filter(p => p !== selectedPlayer);
    
    if (isTargetPlayerResting) {
      // Both players are in resters
      updatedRotation.resters = updatedRotation.resters.filter(p => p !== targetPlayer);
      updatedRotation.resters.push(selectedPlayer);
    } else {
      // Move target player to resters and place selected player in their position
      const targetCourt = updatedRotation.courts[targetCourtIndex];
      updatedRotation.resters.push(targetPlayer);
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
      updatedRotation.resters.push(selectedPlayer);
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
