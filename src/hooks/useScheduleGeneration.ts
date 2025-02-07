
import { parsePlayers, shuffle } from "@/utils/gameUtils";
import type { Rotation } from "@/types/scheduler";
import { toast } from "sonner";
import type { Participant } from "@/types/scheduler";

interface UseScheduleGenerationProps {
  temporaryPlayers: string;
  selectedParticipants: string[];
  participants: Participant[] | undefined;
  setRotations: (rotations: Rotation[]) => void;
  setKingCourtRotation: (rotation: Rotation | null) => void;
}

export const useScheduleGeneration = ({
  temporaryPlayers,
  selectedParticipants,
  participants,
  setRotations,
  setKingCourtRotation
}: UseScheduleGenerationProps) => {
  const generateRandomSchedule = () => {
    const players = parsePlayers(temporaryPlayers, selectedParticipants, participants || []);
    if (players.length < 4) {
      toast.error("Please select at least 4 players");
      return;
    }

    const totalPlayers = players.length;
    const rotations: Rotation[] = [];
    const restCounts = new Array(totalPlayers).fill(0);

    for (let rotationNum = 0; rotationNum < 8; rotationNum++) {
      // Calculate how many complete courts we can make (each court needs 4 players)
      const maxCompleteCourts = Math.floor((totalPlayers - restCounts.filter(count => count > 0).length) / 4);
      const playersNeededForCourts = maxCompleteCourts * 4;
      
      // Determine resters - players who won't play this rotation
      let playersWithRest = players.map((_, idx) => ({ idx, count: restCounts[idx] }));
      playersWithRest.sort((a, b) => a.count - b.count);
      
      const restersCount = totalPlayers - playersNeededForCourts;
      let resters = playersWithRest.slice(0, restersCount).map(p => p.idx);
      resters.forEach(idx => restCounts[idx]++);

      // Get available players for this rotation
      let availablePlayers = playersWithRest
        .filter(p => !resters.includes(p.idx))
        .map(p => p.idx);
      shuffle(availablePlayers);

      // Create courts with complete teams only
      let courts = [];
      for (let i = 0; i < availablePlayers.length; i += 4) {
        if (i + 3 < availablePlayers.length) { // Only create court if we have 4 players
          const courtPlayers = availablePlayers.slice(i, i + 4).map(idx => players[idx]);
          courts.push({
            team1: [courtPlayers[0], courtPlayers[1]],
            team2: [courtPlayers[2], courtPlayers[3]]
          });
        }
      }

      rotations.push({
        courts: courts,
        resters: resters.map(idx => players[idx])
      });
    }

    setRotations(rotations);
  };

  const generateKingCourt = () => {
    const players = parsePlayers(temporaryPlayers, selectedParticipants, participants || []);
    if (players.length < 4) {
      toast.error("Please select at least 4 players");
      return;
    }

    const totalPlayers = players.length;
    const maxCompleteCourts = Math.floor(totalPlayers / 4);
    const playersNeededForCourts = maxCompleteCourts * 4;
    const restersCount = totalPlayers - playersNeededForCourts;

    let availablePlayers = [...Array(totalPlayers).keys()];
    shuffle(availablePlayers);

    let resters = availablePlayers.slice(0, restersCount);
    let activePlayers = availablePlayers.slice(restersCount);

    let courts = [];
    for (let i = 0; i < activePlayers.length; i += 4) {
      if (i + 3 < activePlayers.length) {
        const courtPlayers = activePlayers.slice(i, i + 4).map(idx => players[idx]);
        courts.push({
          team1: [courtPlayers[0], courtPlayers[1]],
          team2: [courtPlayers[2], courtPlayers[3]]
        });
      }
    }

    setKingCourtRotation({
      courts: courts,
      resters: resters.map(idx => players[idx])
    });
  };

  const generateSchedule = () => {
    generateRandomSchedule();
    generateKingCourt();
  };

  return { generateSchedule };
};
