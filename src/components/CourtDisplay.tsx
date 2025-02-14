import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import CourtCard from "./court/CourtCard";
import { Court, Rotation } from "@/types/scheduler";

interface CourtDisplayProps {
  rotations: Rotation[];
  isKingCourt: boolean;
  sessionId?: string;
  sessionStatus?: string;
}

const CourtDisplay = ({ rotations, isKingCourt, sessionId, sessionStatus }: CourtDisplayProps) => {
  const [scores, setScores] = useState<{ [key: string]: { team1: string; team2: string } }>({});
  const [localRotations, setLocalRotations] = useState<Rotation[]>(rotations);
  const [players, setPlayers] = useState<{ [key: string]: { name: string; gender: string } }>({});

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('name, gender');
      
      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      const playersMap = data.reduce((acc: { [key: string]: { name: string; gender: string } }, player) => {
        acc[player.name] = { name: player.name, gender: player.gender };
        return acc;
      });

      setPlayers(playersMap);
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchRotationIds = async () => {
      if (!sessionId) return;
      
      const { data, error } = await supabase
        .from('rotations')
        .select(`
          id,
          is_king_court,
          rotation_number,
          court_assignments (
            court_number,
            team1_players,
            team2_players
          ),
          roation_resters (
            resting_players
          )
        `)
        .eq('session_id', sessionId)
        .order('rotation_number', { ascending: true });
      
      if (error) throw error;

      const updatedRotations = rotations.map((rotation, index) => ({
        ...rotation,
        id: data.find(r => r.rotation_number === index + 1)?.id
      }));
      
      setLocalRotations(updatedRotations);
    };

    fetchRotationIds();
  }, [sessionId, rotations]);

  const handleScoreChange = (
    rotationIndex: number,
    courtIndex: number,
    team: 'team1' | 'team2',
    value: string
  ) => {
    const key = `${rotationIndex}-${courtIndex}`;
    setScores(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [team]: value
      }
    }));
  };

  const handleDragStart = async (
    e: React.DragEvent,
    data: {
      player: string;
      teamType: 'team1' | 'team2';
      courtIndex: number;
      rotationIndex: number;
    }
  ) => {
    await handleSwap(data.player, data.teamType, data.courtIndex, data.rotationIndex);
  };

  const handleSwap = async (
    player: string,
    targetTeamType: 'team1' | 'team2',
    targetCourtIndex: number,
    targetRotationIndex: number
  ) => {
    const newRotations = [...localRotations];
    const targetRotation = newRotations[targetRotationIndex];

    if (!targetRotation || !targetRotation.id) {
      toast.error("Invalid rotation data");
      return;
    }

    const targetCourt = targetRotation.courts[targetCourtIndex];
    if (!targetCourt) {
      toast.error("Invalid court data");
      return;
    }

    let sourceRotationIndex = -1;
    let sourceCourtIndex = -1;
    let sourceTeamType: 'team1' | 'team2' | null = null;

    for (let rIdx = 0; rIdx < newRotations.length; rIdx++) {
      const rotation = newRotations[rIdx];
      for (let cIdx = 0; cIdx < rotation.courts.length; cIdx++) {
        const court = rotation.courts[cIdx];
        if (court.team1.includes(player)) {
          sourceRotationIndex = rIdx;
          sourceCourtIndex = cIdx;
          sourceTeamType = 'team1';
          break;
        }
        if (court.team2.includes(player)) {
          sourceRotationIndex = rIdx;
          sourceCourtIndex = cIdx;
          sourceTeamType = 'team2';
          break;
        }
      }
      if (sourceTeamType) break;
    }

    if (sourceTeamType === null || sourceRotationIndex === -1 || sourceCourtIndex === -1) {
      toast.error("Could not find player's current position");
      return;
    }

    const sourceCourt = newRotations[sourceRotationIndex].courts[sourceCourtIndex];

    if (targetCourt[targetTeamType].length >= 2) {
      toast.error("Team is already full (maximum 2 players)");
      return;
    }

    sourceCourt[sourceTeamType] = sourceCourt[sourceTeamType].filter(p => p !== player);
    targetCourt[targetTeamType] = [...targetCourt[targetTeamType], player];

    if (sessionId && targetRotation.id) {
      try {
        const { error: sourceError } = await supabase
          .from('court_assignments')
          .update({
            team1_players: sourceCourt.team1,
            team2_players: sourceCourt.team2
          })
          .eq('rotation_id', newRotations[sourceRotationIndex].id)
          .eq('court_number', sourceCourtIndex + 1);

        if (sourceError) throw sourceError;

        const { error: targetError } = await supabase
          .from('court_assignments')
          .update({
            team1_players: targetCourt.team1,
            team2_players: targetCourt.team2
          })
          .eq('rotation_id', targetRotation.id)
          .eq('court_number', targetCourtIndex + 1);

        if (targetError) throw targetError;

        const { error: rotationError } = await supabase
          .from('rotations')
          .update({ manually_modified: true })
          .eq('id', targetRotation.id);

        if (rotationError) throw rotationError;

        toast.success("Player position updated successfully");
      } catch (error) {
        console.error('Error updating player positions:', error);
        toast.error("Failed to update player positions");
        setLocalRotations(rotations); // Reset to original state
        return;
      }
    } else {
      toast.success("Player position updated");
    }

    setLocalRotations([...newRotations]);
  };

  const handleSubmitScore = async (rotationIndex: number, courtIndex: number, court: Court) => {
    const key = `${rotationIndex}-${courtIndex}`;
    const scoreData = scores[key];

    if (!scoreData?.team1 || !scoreData?.team2) {
      toast.error("Please enter scores for both teams");
      return;
    }

    const team1Score = parseInt(scoreData.team1);
    const team2Score = parseInt(scoreData.team2);

    if (isNaN(team1Score) || isNaN(team2Score)) {
      toast.error("Please enter valid numbers for scores");
      return;
    }

    if (team1Score === team2Score) {
      toast.error("Scores cannot be equal");
      return;
    }

    const winningTeam = team1Score > team2Score ? court.team1 : court.team2;
    const losingTeam = team1Score > team2Score ? court.team2 : court.team1;
    const winningScore = Math.max(team1Score, team2Score);
    const losingScore = Math.min(team1Score, team2Score);

    try {
      const { error } = await supabase
        .from('game_results')
        .insert({
          session_id: sessionId,
          court_number: courtIndex + 1,
          winning_team_players: winningTeam,
          losing_team_players: losingTeam,
          winning_team_score: winningScore,
          losing_team_score: losingScore,
          game_number: rotationIndex + 1,
          is_best_of_three: isKingCourt
        });

      if (error) throw error;

      toast.success("Score submitted successfully");
      
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[key];
        return newScores;
      });

    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error("Failed to submit score");
    }
  };

  return (
    <div className="space-y-8">
      <div id="court-rotations" className="bg-white">
        {localRotations.map((rotation, idx) => (
          <Card key={idx} className="p-6 mb-6 bg-white">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              {isKingCourt ? "King of the Court Initial Rotation" : `Rotation ${idx + 1}`}
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {rotation.courts.map((court, courtIdx) => (
                <CourtCard
                  key={courtIdx}
                  court={court}
                  courtIndex={courtIdx}
                  rotationIndex={idx}
                  onDragStart={handleDragStart}
                  playerGenders={Object.fromEntries(
                    Object.entries(players).map(([name, data]) => [name, data.gender])
                  )}
                  showScores={sessionStatus === 'Ready' && !isKingCourt}
                  scores={scores[`${idx}-${courtIdx}`] || { team1: '', team2: '' }}
                  onScoreChange={(team, value) => handleScoreChange(idx, courtIdx, team, value)}
                  onSubmitScore={() => handleSubmitScore(idx, courtIdx, court)}
                  allCourts={rotation.courts}
                />
              ))}
            </div>

            {rotation.resters.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-600">Resting:</span>{" "}
                <span>
                  {rotation.resters.map((player, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1">
                      {player}
                      <span className="text-xs text-gray-500">({players[player]?.gender || 'M'})</span>
                      {idx < rotation.resters.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourtDisplay;
