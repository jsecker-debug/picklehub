
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { handlePlayerSwap, updateRotationInDatabase } from "@/services/rotation/playerSwapService";
import { usePlayersData } from "@/hooks/usePlayersData";
import { useRotationData } from "@/hooks/useRotationData";
import { useScoreManagement } from "@/hooks/useScoreManagement";
import { CourtDisplayProps, SwapData } from "@/types/court-display";
import RotationCard from "./court/RotationCard";

const CourtDisplay = ({ rotations, isKingCourt, sessionId, sessionStatus }: CourtDisplayProps) => {
  const players = usePlayersData();
  const { localRotations, setLocalRotations } = useRotationData(rotations, sessionId);
  const { scores, handleScoreChange, handleSubmitScore } = useScoreManagement(sessionId, isKingCourt);

  const handleDragStart = async (e: React.DragEvent, data: SwapData) => {
    const newRotations = [...localRotations];
    const targetRotation = newRotations[data.rotationIndex];
    
    const updatedRotation = handlePlayerSwap(
      data.player,
      data.teamType,
      data.courtIndex,
      targetRotation,
      data.targetPlayer
    );

    if (!updatedRotation) return;

    if (sessionId && targetRotation.id) {
      const success = await updateRotationInDatabase(updatedRotation, sessionId);
      if (!success) {
        toast.error("Failed to update player positions");
        return;
      }
      newRotations[data.rotationIndex] = updatedRotation;
      setLocalRotations(newRotations);
      toast.success("Player position updated successfully");
    } else {
      newRotations[data.rotationIndex] = updatedRotation;
      setLocalRotations(newRotations);
      toast.success("Player position updated");
    }
  };

  return (
    <div className="space-y-12">
      <div id="court-rotations">
        {localRotations.map((rotation, rotationIdx) => (
          <RotationCard
            key={rotationIdx}
            rotation={rotation}
            rotationIdx={rotationIdx}
            isKingCourt={isKingCourt}
            sessionStatus={sessionStatus}
            scores={scores}
            handleScoreChange={handleScoreChange}
            handleSubmitScore={handleSubmitScore}
            handleDragStart={handleDragStart}
            players={players}
          />
        ))}
      </div>
    </div>
  );
};

export default CourtDisplay;
