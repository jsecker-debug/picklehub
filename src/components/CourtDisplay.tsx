
import { Card } from "@/components/ui/card";

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
}

const CourtDisplay = ({ rotations, isKingCourt }: CourtDisplayProps) => {
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
