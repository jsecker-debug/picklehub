
import { Card } from "@/components/ui/card";
import TeamDisplay from "./TeamDisplay";
import ScoreInput from "./ScoreInput";
import { Court } from "@/types/scheduler";
import { PlayerData } from "@/types/court-display";

interface CourtCardProps {
  court: Court;
  courtIndex: number;
  rotationIndex: number;
  onDragStart: (e: React.DragEvent, data: { 
    player: string; 
    teamType: 'team1' | 'team2';
    courtIndex: number;
    rotationIndex: number;
    targetPlayer?: string;
  }) => void;
  playerGenders: { [key: string]: PlayerData };
  showScores: boolean;
  scores: { team1: string; team2: string };
  onScoreChange: (team: 'team1' | 'team2', value: string) => void;
  onSubmitScore: () => void;
  allCourts: Court[];
  restingPlayers: string[];
}

const CourtCard = ({
  court,
  courtIndex,
  rotationIndex,
  onDragStart,
  playerGenders,
  showScores,
  scores,
  onScoreChange,
  onSubmitScore,
  allCourts,
  restingPlayers,
}: CourtCardProps) => {
  return (
    <Card className="p-5 border-2 border-accent/30 bg-white shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-2xl font-bold mb-4 text-primary bg-accent/10 py-2 px-3 rounded-lg">
        Court {courtIndex + 1}
      </h3>
      <div className="space-y-4">
        <TeamDisplay
          label="Team 1"
          players={court.team1}
          teamType="team1"
          courtIndex={courtIndex}
          rotationIndex={rotationIndex}
          onDragStart={onDragStart}
          allCourts={allCourts}
          playerGenders={playerGenders}
          restingPlayers={restingPlayers}
        />
        <TeamDisplay
          label="Team 2"
          players={court.team2}
          teamType="team2"
          courtIndex={courtIndex}
          rotationIndex={rotationIndex}
          onDragStart={onDragStart}
          allCourts={allCourts}
          playerGenders={playerGenders}
          restingPlayers={restingPlayers}
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
