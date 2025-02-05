
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourtDisplay from "@/components/CourtDisplay";
import ParticipantSelection from "@/components/scheduler/ParticipantSelection";
import TemporaryPlayersInput from "@/components/scheduler/TemporaryPlayersInput";
import GenerateButtons from "@/components/scheduler/GenerateButtons";
import { useParticipants } from "@/hooks/useParticipants";
import { parsePlayers, shuffle } from "@/utils/gameUtils";
import type { Rotation } from "@/types/scheduler";

const GameManager = () => {
  const [temporaryPlayers, setTemporaryPlayers] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [isKingCourt, setIsKingCourt] = useState(false);

  const { data: participants } = useParticipants();

  const handleClear = () => {
    setTemporaryPlayers("");
    setSelectedParticipants([]);
    setRotations([]);
    setIsKingCourt(false);
    toast.success("All fields cleared");
  };

  const generatePart1 = () => {
    const players = parsePlayers(temporaryPlayers, selectedParticipants, participants || []);
    if (players.length < 4) {
      toast.error("Please select at least 4 players");
      return;
    }

    const totalPlayers = players.length;
    const rotations: Rotation[] = [];
    const restCounts = new Array(totalPlayers).fill(0);

    for (let rotationNum = 0; rotationNum < 8; rotationNum++) {
      let maxPlayersPerRotation = 4 * 4; // 16
      let restersCount;
      if (totalPlayers <= maxPlayersPerRotation) {
        restersCount = totalPlayers % 4 === 0 ? 0 : 4 - (totalPlayers % 4);
      } else {
        restersCount = totalPlayers - maxPlayersPerRotation;
      }

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

      let courts: Court[] = [];
      for (let i = 0; i < nonResters.length; i += 4) {
        let courtIndices = nonResters.slice(i, i + 4);
        let courtPlayers = courtIndices.map((idx) => players[idx]);
        courts.push({
          team1: [courtPlayers[0], courtPlayers[1]],
          team2: [courtPlayers[2], courtPlayers[3]],
        });
      }

      rotations.push({
        courts: courts,
        resters: resters.map((idx) => players[idx]),
      });
    }

    setRotations(rotations);
    setIsKingCourt(false);
    toast.success("Schedule generated successfully!");
  };

  const generatePart2 = () => {
    const players = parsePlayers(temporaryPlayers, selectedParticipants, participants || []);
    if (players.length < 4) {
      toast.error("Please select at least 4 players");
      return;
    }

    const totalPlayers = players.length;
    let maxPlayers = 4 * 4; // 16
    let restersCount;

    if (totalPlayers <= maxPlayers) {
      restersCount = totalPlayers % 4 === 0 ? 0 : 4 - (totalPlayers % 4);
    } else {
      restersCount = totalPlayers - maxPlayers;
    }

    let sortedPlayers = players.map((_, idx) => idx);
    shuffle(sortedPlayers);

    let resters = sortedPlayers.slice(0, restersCount);
    let nonResters = sortedPlayers.slice(restersCount);
    shuffle(nonResters);

    let courts: Court[] = [];
    for (let i = 0; i < nonResters.length; i += 4) {
      let courtIndices = nonResters.slice(i, i + 4);
      let courtPlayers = courtIndices.map((idx) => players[idx]);
      courts.push({
        team1: [courtPlayers[0], courtPlayers[1]],
        team2: [courtPlayers[2], courtPlayers[3]],
      });
    }

    setRotations([
      {
        courts: courts,
        resters: resters.map((idx) => players[idx]),
      },
    ]);
    setIsKingCourt(true);
    toast.success("King of the Court schedule generated!");
  };

  return (
    <Card className="p-6 mb-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Participants</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        </div>
        <ParticipantSelection
          participants={participants}
          selectedParticipants={selectedParticipants}
          onParticipantToggle={(id, checked) => {
            setSelectedParticipants(prev =>
              checked
                ? [...prev, id]
                : prev.filter(pid => pid !== id)
            );
          }}
        />
      </div>

      <TemporaryPlayersInput
        value={temporaryPlayers}
        onChange={setTemporaryPlayers}
      />

      <GenerateButtons
        onGenerateSchedule={generatePart1}
        onGenerateKingCourt={generatePart2}
      />

      {rotations.length > 0 && (
        <CourtDisplay rotations={rotations} isKingCourt={isKingCourt} />
      )}
    </Card>
  );
};

export default GameManager;
