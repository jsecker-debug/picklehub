import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import CourtCard from "./CourtCard";
import RestingPlayers from "./RestingPlayers";
import { Court, Rotation } from "@/types/scheduler";
import { ScoreData, PlayerData } from "@/types/court-display";

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
  const [completed, setCompleted] = useState(false);
  
  return (
    <Card 
      key={rotationIdx} 
      className={`rotation-card p-6 mb-10 bg-gradient-to-b from-white to-gray-50 border-2 border-accent/20 shadow-lg ${completed ? 'opacity-70' : ''}`}
    >
      <div className="mb-8 flex items-center gap-4">
        <div className="flex items-center justify-center w-20 h-20 text-4xl font-bold bg-primary text-white rounded-full shadow-md">
          {rotationIdx + 1}
        </div>
        <div className="flex-1 flex items-center gap-4">
          <h2 className={`text-3xl font-bold text-primary ${completed ? 'line-through' : ''}`}>
            {isKingCourt ? "King of the Court Initial Rotation" : `Rotation ${rotationIdx + 1}`}
          </h2>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`complete-rotation-${rotationIdx}`} 
              checked={completed} 
              onCheckedChange={() => setCompleted(!completed)}
              className="h-6 w-6 border-2"
            />
            <label 
              htmlFor={`complete-rotation-${rotationIdx}`}
              className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Completed
            </label>
          </div>
        </div>
      </div>
      
      <div className={`overflow-x-auto pb-6 ${completed ? 'line-through' : ''}`}>
        <div className="flex flex-wrap gap-6">
          {rotation.courts.map((court, courtIdx) => (
            <div key={courtIdx} className="min-w-[320px] flex-1">
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

      <div className={`mt-8 ${completed ? 'line-through' : ''}`}>
        {rotation.resters.length > 0 ? (
          <RestingPlayers
            resters={rotation.resters}
            players={players}
            rotationIndex={rotationIdx}
            onDragStart={handleDragStart}
            allCourts={rotation.courts}
          />
        ) : (
          <div className="p-5 bg-green-50 rounded-lg text-xl font-medium text-green-700 border border-green-200">
            All players are on courts in this rotation
          </div>
        )}
      </div>
    </Card>
  );
};

export default RotationCard;
