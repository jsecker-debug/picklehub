import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import CourtDisplay from "@/components/CourtDisplay";

interface Court {
  team1: string[];
  team2: string[];
}

interface Rotation {
  courts: Court[];
  resters: string[];
}

const Index = () => {
  const [playerList, setPlayerList] = useState("");
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [isKingCourt, setIsKingCourt] = useState(false);

  const parsePlayers = () => {
    return playerList.split(/[\n,]/).map((s) => s.trim()).filter((s) => s !== "");
  };

  const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const generatePart1 = () => {
    const players = parsePlayers();
    if (players.length < 4) {
      toast.error("Please enter at least 4 players");
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
    const players = parsePlayers();
    if (players.length < 4) {
      toast.error("Please enter at least 4 players");
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Pickleball Session Scheduler
          </h1>
          <p className="text-gray-600">
            Enter player names separated by commas or new lines
          </p>
        </div>

        <Card className="p-6 mb-6">
          <Textarea
            value={playerList}
            onChange={(e) => setPlayerList(e.target.value)}
            placeholder="John Smith, Jane Doe, Mike Johnson..."
            className="mb-4 min-h-[120px]"
          />
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={generatePart1}
              className="bg-primary hover:bg-primary/90"
            >
              Generate First Half Schedule
            </Button>
            <Button
              onClick={generatePart2}
              className="bg-secondary hover:bg-secondary/90"
            >
              Generate King of the Court
            </Button>
          </div>
        </Card>

        {rotations.length > 0 && (
          <CourtDisplay rotations={rotations} isKingCourt={isKingCourt} />
        )}
      </div>
    </div>
  );
};

export default Index;