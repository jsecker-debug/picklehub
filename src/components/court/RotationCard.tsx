
import { Card } from "@/components/ui/card";
import CourtCard from "./CourtCard";
import RestingPlayers from "./RestingPlayers";
import { Court, Rotation } from "@/types/scheduler";
import { ScoreData } from "@/types/court-display";
import { PlayerData } from "@/types/court-display";

interface RotationCardProps {
  rotation: Rotation;
  rotationIdx: number;
  isKingCourt: boolean;
  sessionStatus?: string;
  scores: { [key: string]: ScoreData };
  handleScoreChange: (
    rotationIndex: number,
    courtIndex: number,
    team: 'team1' | 'team2',
    value: string
  ) => void;
  handleSubmitScore: (rotationIndex: number, courtIndex: number, court: Court) => void;
  handleDragStart: (e: React.DragEvent, data: { 
    player: string; 
    teamType: 'team1' | 'team2';
    courtIndex: number;
    rotationIndex: number;
    targetPlayer?: string;
  }) => void;
  players: { [key: string]: PlayerData };
}

const RotationCard = ({
  rotation,
  rotationIdx,
  isKingCourt,
  sessionStatus,
  scores,
  handleScoreChange,
  handleSubmitScore,
  handleDragStart,
  players,
}: RotationCardProps) => {
  return (
    <Card key={rotationIdx} className="p-6 mb-10 bg-white">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 text-4xl font-bold bg-primary text-white rounded-full">
          {rotationIdx + 1}
        </div>
        <h2 className="text-3xl font-semibold text-primary">
          {isKingCourt ? "King of the Court Initial Rotation" : `Rotation ${rotationIdx + 1}`}
        </h2>
      </div>
      
      <div className="overflow-x-auto pb-6">
        <div className="flex flex-wrap gap-6">
          {rotation.courts.map((court, courtIdx) => (
            <div key={courtIdx} className="min-w-[300px] flex-1">
              <CourtCard
                court={court}
                courtIndex={courtIdx}
                rotationIndex={rotationIdx}
                onDragStart={handleDragStart}
                playerGenders={players}
                showScores={sessionStatus === 'Ready' && !isKingCourt}
                scores={scores[`${rotationIdx}-${courtIdx}`] || { team1: '', team2: '' }}
                onScoreChange={(team, value) => handleScoreChange(rotationIdx, courtIdx, team, value)}
                onSubmitScore={() => handleSubmitScore(rotationIdx, courtIdx, court)}
                allCourts={rotation.courts}
                restingPlayers={rotation.resters}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-2xl font-semibold mb-4">Sitting Out</h3>
        <div className="flex flex-wrap gap-3">
          {rotation.resters.map((player, idx) => (
            <div key={idx} className="bg-yellow-100 px-4 py-2 rounded-lg text-xl">
              {player}
            </div>
          ))}
          {rotation.resters.length === 0 && (
            <div className="text-gray-500 text-xl">No players sitting out in this rotation</div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RotationCard;
