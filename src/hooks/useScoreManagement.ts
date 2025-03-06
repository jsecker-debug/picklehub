
import { useState } from "react";
import { Court } from "@/types/scheduler";
import { ScoreData } from "@/types/court-display";
import { validateAndSubmitScore } from "@/services/rotation/scoreService";

export const useScoreManagement = (sessionId?: string, isKingCourt: boolean = false) => {
  const [scores, setScores] = useState<{ [key: string]: ScoreData }>({});

  const handleScoreChange = (
    rotationIndex: number,
    courtIndex: number,
    team: 'team1' | 'team2',
    value: string
  ) => {
    setScores(prev => ({
      ...prev,
      [`${rotationIndex}-${courtIndex}`]: {
        ...prev[`${rotationIndex}-${courtIndex}`],
        [team]: value
      }
    }));
  };

  const handleSubmitScore = async (rotationIndex: number, courtIndex: number, court: Court) => {
    const key = `${rotationIndex}-${courtIndex}`;
    const scoreData = scores[key];

    if (!sessionId) return;

    const success = await validateAndSubmitScore(
      scoreData,
      court,
      sessionId,
      courtIndex,
      rotationIndex,
      isKingCourt
    );

    if (success) {
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[key];
        return newScores;
      });
    }
  };

  return {
    scores,
    handleScoreChange,
    handleSubmitScore
  };
};
