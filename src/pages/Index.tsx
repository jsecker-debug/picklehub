
import GameManager from "@/components/game-manager/GameManager";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Pickleball Session Scheduler
          </h1>
          <p className="text-gray-600">
            Select participants and add temporary players
          </p>
        </div>

        <GameManager />
      </div>
    </div>
  );
};

export default Index;
