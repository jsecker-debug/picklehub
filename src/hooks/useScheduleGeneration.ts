
import { useState } from "react";
import { Participant } from "@/types/scheduler";
import { toast } from "sonner";

interface UseScheduleGenerationProps {
  temporaryPlayers: string;
  selectedParticipants: string[];
  participants: Participant[] | undefined;
  setRotations: (rotations: any[]) => void;
  setKingCourtRotation: (rotation: any | null) => void;
}

export const useScheduleGeneration = ({
  temporaryPlayers,
  selectedParticipants,
  participants,
  setRotations,
  setKingCourtRotation,
}: UseScheduleGenerationProps) => {
  const generateSchedule = (rotationCount: number = 8) => {
    // Validate inputs
    if (!participants) {
      toast.error("No participants data available");
      return;
    }

    if (selectedParticipants.length === 0 && !temporaryPlayers) {
      toast.error("Please select participants or add temporary players");
      return;
    }

    // Process temporary players
    const tempPlayersList = temporaryPlayers
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // Create a map of participant IDs to names
    const participantMap = new Map(
      participants.map(p => [p.id, p.name])
    );

    // Convert selected participant IDs to names
    const selectedPlayerNames = selectedParticipants.map(id => participantMap.get(id) || id);

    // Combine selected and temporary players
    const allPlayers = [
      ...selectedPlayerNames,
      ...tempPlayersList
    ];

    if (allPlayers.length < 4) {
      toast.error("Need at least 4 players to generate a schedule");
      return;
    }

    // Generate rotations based on the count
    const generatedRotations = Array(rotationCount).fill(null).map((_, index) => ({
      courts: [
        {
          team1: allPlayers.slice(0, 2),
          team2: allPlayers.slice(2, 4)
        }
      ],
      resters: allPlayers.slice(4),
      id: `rotation-${index + 1}`
    }));

    setRotations(generatedRotations);

    // Generate king court rotation
    const kingCourtRotation = {
      courts: [
        {
          team1: allPlayers.slice(0, 2),
          team2: allPlayers.slice(2, 4)
        }
      ],
      resters: allPlayers.slice(4),
      id: 'king-court'
    };

    setKingCourtRotation(kingCourtRotation);
    toast.success(`Generated ${rotationCount} rotations successfully`);
  };

  return { generateSchedule };
};
