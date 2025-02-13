import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import DraggablePlayer from "./DraggablePlayer";

interface Player {
  name: string;
  gender: string;
}

interface Court {
  team1: string[];
  team2: string[];
}

interface Rotation {
  courts: Court[];
  resters: string[];
  id?: string;
}

interface CourtDisplayProps {
  rotations: Rotation[];
  isKingCourt: boolean;
  sessionId?: string;
  sessionStatus?: string;
}

const CourtDisplay = ({ rotations, isKingCourt, sessionId, sessionStatus }: CourtDisplayProps) => {
  const [scores, setScores] = useState<{ [key: string]: { team1: string; team2: string } }>({});
  const [localRotations, setLocalRotations] = useState<Rotation[]>(rotations);
  const [players, setPlayers] = useState<{ [key: string]: Player }>({});
  const [dragData, setDragData] = useState<{
    player: string;
    teamType: 'team1' | 'team2';
    courtIndex: number;
    rotationIndex: number;
  } | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('name, gender');
      
      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      const playersMap = data.reduce((acc: { [key: string]: Player }, player) => {
        acc[player.name] = { name: player.name, gender: player.gender };
        return acc;
      }, {});

      setPlayers(playersMap);
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchRotationIds = async () => {
      if (!sessionId) return;
      
      const { data, error } = await supabase
        .from('rotations')
        .select('id, rotation_number')
        .eq('session_id', sessionId)
        .order('rotation_number', { ascending: true });
      
      if (error) {
        console.error('Error fetching rotation IDs:', error);
        return;
      }

      // Update local rotations with their IDs
      setLocalRotations(prevRotations => 
        prevRotations.map((rotation, index) => ({
          ...rotation,
          id: data.find(r => r.rotation_number === index + 1)?.id
        }))
      );
    };

    fetchRotationIds();
  }, [sessionId]);

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
    setDragData(data);
    await handleDrop(e, data.teamType, data.courtIndex, data.rotationIndex);
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetTeamType: 'team1' | 'team2',
    targetCourtIndex: number,
    targetRotationIndex: number
  ) => {
    e.preventDefault();
    if (!dragData) return;

    const newRotations = [...localRotations];
    const sourceRotation = newRotations[dragData.rotationIndex];
    const targetRotation = newRotations[targetRotationIndex];

    if (!sourceRotation || !targetRotation) return;

    const sourceCourt = sourceRotation.courts[dragData.courtIndex];
    const targetCourt = targetRotation.courts[targetCourtIndex];

    if (!sourceCourt || !targetCourt) return;

    // Get the player being dropped on
    const targetTeamPlayers = targetCourt[targetTeamType];
    const sourceTeamPlayers = sourceCourt[dragData.teamType];

    // Find the position index of the dragged player in the source team
    const draggedPlayerIndex = sourceTeamPlayers.indexOf(dragData.player);
    
    // Find the position index in target team that corresponds to where the player was dropped
    // If the target team has two players, use the same index as the source
    // If the target team has one player, use index 0
    const targetIndex = Math.min(draggedPlayerIndex, targetTeamPlayers.length - 1);

    // Get the player to swap with (if any)
    const playerToSwap = targetTeamPlayers[targetIndex];

    // Create new arrays for the updated teams
    const newSourceTeamPlayers = [...sourceTeamPlayers];
    const newTargetTeamPlayers = [...targetTeamPlayers];

    // Update the source team - replace dragged player with swapped player
    if (playerToSwap) {
      newSourceTeamPlayers[draggedPlayerIndex] = playerToSwap;
    }

    // Update the target team - place dragged player in the correct position
    if (targetIndex < newTargetTeamPlayers.length) {
      newTargetTeamPlayers[targetIndex] = dragData.player;
    } else {
      newTargetTeamPlayers.push(dragData.player);
    }

    // Update the courts with the new player arrangements
    sourceCourt[dragData.teamType] = newSourceTeamPlayers;
    targetCourt[targetTeamType] = newTargetTeamPlayers;

    setLocalRotations(newRotations);

    // Update in Supabase
    try {
      // Update both rotations to mark them as manually modified
      const rotationsToUpdate = [sourceRotation.id, targetRotation.id];
      for (const rotationId of rotationsToUpdate) {
        const { error: rotationError } = await supabase
          .from('rotations')
          .update({ manually_modified: true })
          .eq('id', rotationId);

        if (rotationError) throw rotationError;
      }

      // Update both court assignments
      const updates = [
        {
          rotation_id: sourceRotation.id,
          court_number: dragData.courtIndex + 1,
          data: {
            team1_players: sourceCourt.team1,
            team2_players: sourceCourt.team2
          }
        },
        {
          rotation_id: targetRotation.id,
          court_number: targetCourtIndex + 1,
          data: {
            team1_players: targetCourt.team1,
            team2_players: targetCourt.team2
          }
        }
      ];

      for (const update of updates) {
        const { error: courtError } = await supabase
          .from('court_assignments')
          .update(update.data)
          .eq('rotation_id', update.rotation_id)
          .eq('court_number', update.court_number);

        if (courtError) throw courtError;
      }

      toast.success("Player positions updated successfully");
    } catch (error) {
      console.error('Error updating player positions:', error);
      toast.error("Failed to update player positions");
      // Revert changes on error
      setLocalRotations(rotations);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
        {localRotations.map((rotation, idx) => (
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
                    <div 
                      className="flex justify-between items-center p-2 rounded border border-transparent hover:border-gray-200"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'team1', courtIdx, idx)}
                    >
                      <span className="text-sm text-gray-600">Team 1:</span>
                      <span className="font-medium space-x-2">
                        {court.team1.map((player, playerIdx) => (
                          <DraggablePlayer
                            key={playerIdx}
                            player={player}
                            gender={players[player]?.gender || 'M'}
                            teamType="team1"
                            courtIndex={courtIdx}
                            rotationIndex={idx}
                            onDragStart={handleDragStart}
                            allPlayers={Object.values(players)}
                          />
                        ))}
                      </span>
                    </div>
                    <div 
                      className="flex justify-between items-center p-2 rounded border border-transparent hover:border-gray-200"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'team2', courtIdx, idx)}
                    >
                      <span className="text-sm text-gray-600">Team 2:</span>
                      <span className="font-medium space-x-2">
                        {court.team2.map((player, playerIdx) => (
                          <DraggablePlayer
                            key={playerIdx}
                            player={player}
                            gender={players[player]?.gender || 'M'}
                            teamType="team2"
                            courtIndex={courtIdx}
                            rotationIndex={idx}
                            onDragStart={handleDragStart}
                            allPlayers={Object.values(players)}
                          />
                        ))}
                      </span>
                    </div>

                    {sessionStatus === 'Ready' && !isKingCourt && (
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
