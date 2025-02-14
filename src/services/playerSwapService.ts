
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

  if (!sourceTeamType) {
    isSelectedPlayerResting = targetRotation.resters.includes(selectedPlayer);
  }

  if (!sourceTeamType && !isSelectedPlayerResting) {
    toast.error("Could not find selected player's position in this rotation");
    return null;
  }

  const targetCourt = targetRotation.courts[targetCourtIndex];
  const clickedPlayer = targetCourt[targetTeamType][0];

  if (isSelectedPlayerResting) {
    targetRotation.resters = targetRotation.resters.filter(p => p !== selectedPlayer);
    targetRotation.resters.push(clickedPlayer);
    targetCourt[targetTeamType] = targetCourt[targetTeamType].map(p => 
      p === clickedPlayer ? selectedPlayer : p
    );
  } else if (sourceTeamType) {
    const sourceCourt = targetRotation.courts[sourceCourtIndex];
    sourceCourt[sourceTeamType] = sourceCourt[sourceTeamType].map(p => 
      p === selectedPlayer ? clickedPlayer : p
    );
    targetCourt[targetTeamType] = targetCourt[targetTeamType].map(p => 
      p === clickedPlayer ? selectedPlayer : p
    );
  }

  return targetRotation;
};
