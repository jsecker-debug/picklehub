
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
  rotationCount: number;
}

export const useScheduleGeneration = ({
  temporaryPlayers,
  selectedParticipants,
  participants,
  setRotations,
  setKingCourtRotation,
  rotationCount
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

    for (let rotationNum = 0; rotationNum < rotationCount; rotationNum++) {
      let maxPlayersPerRotation = Math.floor(totalPlayers / 4) * 4;
      let restersCount = totalPlayers - maxPlayersPerRotation;

      let playersWithRest = players.map((_, idx) => ({ idx, count: restCounts[idx] }));
      playersWithRest.sort((a, b) => a.count - b.count);
      
      let groups: { [key: number]: number[] } = {};
      playersWithRest.forEach((p) => {
        if (!groups[p.count]) groups[p.count] = [];
        groups[p.count].push(p.idx);
      });
      Object.values(groups).forEach((group) => shuffle(group));
      let sortedPlayers = Object.values(groups).flat();

      let resters = sortedPlayers.slice(0, restersCount);
      resters.forEach((idx) => restCounts[idx]++);

      let nonResters = sortedPlayers.slice(restersCount);
      shuffle(nonResters);

      let courts = [];
      for (let i = 0; i < nonResters.length; i += 4) {
        if (i + 3 < nonResters.length) {
          let courtIndices = nonResters.slice(i, i + 4);
          let courtPlayers = courtIndices.map((idx) => players[idx]);
          courts.push({
            team1: [courtPlayers[0], courtPlayers[1]],
            team2: [courtPlayers[2], courtPlayers[3]]
          });
        }
      }

      rotations.push({
        courts: courts,
        resters: resters.map((idx) => players[idx])
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
    let maxPlayers = Math.floor(totalPlayers / 4) * 4;
    let restersCount = totalPlayers - maxPlayers;

    let sortedPlayers = players.map((_, idx) => idx);
    shuffle(sortedPlayers);

    let resters = sortedPlayers.slice(0, restersCount);
    let nonResters = sortedPlayers.slice(restersCount);
    shuffle(nonResters);

    let courts = [];
    for (let i = 0; i < nonResters.length; i += 4) {
      if (i + 3 < nonResters.length) {
        let courtIndices = nonResters.slice(i, i + 4);
        let courtPlayers = courtIndices.map((idx) => players[idx]);
        courts.push({
          team1: [courtPlayers[0], courtPlayers[1]],
          team2: [courtPlayers[2], courtPlayers[3]]
        });
      }
    }

    setKingCourtRotation({
      courts: courts,
      resters: resters.map((idx) => players[idx])
    });
  };

  const generateSchedule = () => {
    generateRandomSchedule();
    generateKingCourt();
  };

  return { generateSchedule };
};
