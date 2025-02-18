
import { Card } from "@/components/ui/card";
import TeamDisplay from "./TeamDisplay";
import ScoreInput from "./ScoreInput";
import { Court } from "@/types/scheduler";
import { SwapData } from "@/types/court-display";

interface CourtCardProps {
  court: Court;
  courtIndex: number;
  rotationIndex: number;
  onSwapPlayers: (data: SwapData) => void;
  playerGenders: { [key: string]: string };
  showScores: boolean;
  scores: { team1: string; team2: string };
  onScoreChange: (team: 'team1' | 'team2', value: string) => void;
  onSubmitScore: () => void;
  allCourts: Court[];
  restingPlayers: string[];
  allPlayers: string[];
}

const CourtCard = ({
  court,
  courtIndex,
  rotationIndex,
  onSwapPlayers,
  playerGenders,
  showScores,
  scores,
  onScoreChange,
  onSubmitScore,
  allCourts,
  restingPlayers,
  allPlayers,
}: CourtCardProps) => {
  return (
    <Card className="p-4 border-2 border-accent/20 bg-white">
      <h3 className="text-lg font-medium mb-3 text-primary">
        Court {courtIndex + 1}
      </h3>
      <div className="space-y-2">
        <TeamDisplay
          label="Team 1"
          players={court.team1}
          teamType="team1"
          courtIndex={courtIndex}
          rotationIndex={rotationIndex}
          onSwapPlayers={onSwapPlayers}
          allCourts={allCourts}
          playerGenders={playerGenders}
          restingPlayers={restingPlayers}
          allPlayers={allPlayers}
        />
        <TeamDisplay
          label="Team 2"
          players={court.team2}
          teamType="team2"
          courtIndex={courtIndex}
          rotationIndex={rotationIndex}
          onSwapPlayers={onSwapPlayers}
          allCourts={allCourts}
          playerGenders={playerGenders}
          restingPlayers={restingPlayers}
          allPlayers={allPlayers}
        />

        {showScores && (
          <ScoreInput
            court={court}
            scores={scores}
            onScoreChange={onScoreChange}
            onSubmitScore={onSubmitScore}
          />
        )}
      </div>
    </Card>
  );
};

export default CourtCard;
