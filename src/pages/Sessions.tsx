
import { Card } from "@/components/ui/card";

const Sessions = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Sessions</h1>
        <p className="text-gray-600 mt-2">Manage your pickleball sessions</p>
      </div>

      <Card className="p-6">
        <div className="text-center text-gray-500">
          No sessions found. Start by creating a new session.
        </div>
      </Card>
    </div>
  );
};

export default Sessions;
