
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourtDisplay from "@/components/CourtDisplay";
import ParticipantSelection from "@/components/scheduler/ParticipantSelection";
import TemporaryPlayersInput from "@/components/scheduler/TemporaryPlayersInput";
import { useParticipants } from "@/hooks/useParticipants";
import { useSessions } from "@/hooks/useSessions";
import { parsePlayers, shuffle } from "@/utils/gameUtils";
import type { Rotation } from "@/types/scheduler";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";

const GameManager = () => {
  const [temporaryPlayers, setTemporaryPlayers] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [kingCourtRotation, setKingCourtRotation] = useState<Rotation | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>("");

  const { data: participants } = useParticipants();
  const { data: sessions } = useSessions();

  const handleClear = () => {
    setTemporaryPlayers("");
    setSelectedParticipants([]);
    setRotations([]);
    setKingCourtRotation(null);
    setSelectedSession("");
    toast.success("All fields cleared");
  };

  const generateSchedule = () => {
    generateRandomSchedule();
    generateKingCourt();
  };

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

      let courts = [];
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
  };

  const generateKingCourt = () => {
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

    let courts = [];
    for (let i = 0; i < nonResters.length; i += 4) {
      let courtIndices = nonResters.slice(i, i + 4);
      let courtPlayers = courtIndices.map((idx) => players[idx]);
      courts.push({
        team1: [courtPlayers[0], courtPlayers[1]],
        team2: [courtPlayers[2], courtPlayers[3]],
      });
    }

    setKingCourtRotation({
      courts: courts,
      resters: resters.map((idx) => players[idx]),
    });
  };

  const saveScheduleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSession) {
        throw new Error("Please select a session");
      }

      // Save random schedule rotations
      for (let i = 0; i < rotations.length; i++) {
        const rotation = rotations[i];
        
        // Insert rotation
        const { data: rotationData, error: rotationError } = await supabase
          .from('rotations')
          .insert({
            session_id: selectedSession,
            is_king_court: false,
            rotation_number: i + 1
          })
          .select()
          .single();

        if (rotationError) throw rotationError;

        // Insert court assignments
        const courtAssignments = rotation.courts.map((court, courtIndex) => ({
          rotation_id: rotationData.id,
          court_number: courtIndex + 1,
          team1_players: court.team1,
          team2_players: court.team2
        }));

        const { error: courtsError } = await supabase
          .from('court_assignments')
          .insert(courtAssignments);

        if (courtsError) throw courtsError;

        // Insert resters if any
        if (rotation.resters.length > 0) {
          const { error: restersError } = await supabase
            .from('rotation_resters')
            .insert({
              rotation_id: rotationData.id,
              resting_players: rotation.resters
            });

          if (restersError) throw restersError;
        }
      }

      // Save king of court rotation if exists
      if (kingCourtRotation) {
        const { data: kingRotationData, error: kingRotationError } = await supabase
          .from('rotations')
          .insert({
            session_id: selectedSession,
            is_king_court: true,
            rotation_number: null
          })
          .select()
          .single();

        if (kingRotationError) throw kingRotationError;

        // Insert court assignments for king of court
        const kingCourtAssignments = kingCourtRotation.courts.map((court, courtIndex) => ({
          rotation_id: kingRotationData.id,
          court_number: courtIndex + 1,
          team1_players: court.team1,
          team2_players: court.team2
        }));

        const { error: kingCourtsError } = await supabase
          .from('court_assignments')
          .insert(kingCourtAssignments);

        if (kingCourtsError) throw kingCourtsError;

        // Insert resters if any
        if (kingCourtRotation.resters.length > 0) {
          const { error: kingRestersError } = await supabase
            .from('rotation_resters')
            .insert({
              rotation_id: kingRotationData.id,
              resting_players: kingCourtRotation.resters
            });

          if (kingRestersError) throw kingRestersError;
        }
      }
    },
    onSuccess: () => {
      toast.success("Schedule saved to session successfully");
    },
    onError: (error) => {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule to session");
    },
  });

  const upcomingSessions = sessions?.filter(session => 
    new Date(session.Date) > new Date()
  ) || [];

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

      <div className="flex justify-center mb-6">
        <Button
          onClick={generateSchedule}
          className="bg-primary hover:bg-primary/90"
        >
          Generate Schedule
        </Button>
      </div>

      {rotations.length > 0 && (
        <CourtDisplay rotations={rotations} isKingCourt={false} />
      )}

      {kingCourtRotation && (
        <div className="mt-8">
          <CourtDisplay rotations={[kingCourtRotation]} isKingCourt={true} />
        </div>
      )}

      {(rotations.length > 0 || kingCourtRotation) && (
        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Session to Save Schedule</label>
            <Select 
              value={selectedSession} 
              onValueChange={setSelectedSession}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                {upcomingSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {new Date(session.Date).toLocaleDateString()} - {session.Venue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => saveScheduleMutation.mutate()}
            disabled={!selectedSession || saveScheduleMutation.isPending}
            className="w-full"
          >
            {saveScheduleMutation.isPending ? "Saving..." : "Save to Session"}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default GameManager;

