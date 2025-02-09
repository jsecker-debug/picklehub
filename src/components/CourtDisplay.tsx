
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Court {
  team1: string[];
  team2: string[];
}

interface Rotation {
  courts: Court[];
  resters: string[];
}

interface CourtDisplayProps {
  rotations: Rotation[];
  isKingCourt: boolean;
  sessionId?: string;
  sessionStatus?: string;
}

const CourtDisplay = ({ rotations, isKingCourt, sessionId, sessionStatus }: CourtDisplayProps) => {
  const [scores, setScores] = useState<{ [key: string]: { team1: string; team2: string } }>({});

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
      
      // Clear the scores for this court
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
        {rotations.map((rotation, idx) => (
          <Card key={idx} className="p-6 mb-6 bg-white">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              {isKingCourt ? "King of the Court Initial Rotation" : `Rotation ${idx + 1}`}
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {rotation.courts.map((court, courtIdx) => (
                <Card key={courtIdx} className="p-4 border-2 border-accent/20 bg-white">
                  <h3 className="text-lg font-medium mb-3 text-primary">
                    Court {courtIdx + 1}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Team 1:</span>
                      <span className="font-medium">{court.team1.join(" & ")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Team 2:</span>
                      <span className="font-medium">{court.team2.join(" & ")}</span>
                    </div>

                    {sessionStatus === 'Ready' && (
                      <div className="mt-4 space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Input
                              type="number"
                              placeholder="Team 1 Score"
                              value={scores[`${idx}-${courtIdx}`]?.team1 || ''}
                              onChange={(e) => handleScoreChange(idx, courtIdx, 'team1', e.target.value)}
                              min="0"
                              max="21"
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              type="number"
                              placeholder="Team 2 Score"
                              value={scores[`${idx}-${courtIdx}`]?.team2 || ''}
                              onChange={(e) => handleScoreChange(idx, courtIdx, 'team2', e.target.value)}
                              min="0"
                              max="21"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleSubmitScore(idx, courtIdx, court)}
                          className="w-full"
                        >
                          Submit Score
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {rotation.resters.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-600">Resting:</span>{" "}
                <span>{rotation.resters.join(", ")}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourtDisplay;

