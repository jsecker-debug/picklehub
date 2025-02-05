import { Card } from "@/components/ui/card";

const Participants = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Participants Management
          </h1>
          <p className="text-gray-600">
            Manage your frequent players here
          </p>
        </div>

        <Card className="p-6">
          <p className="text-center text-gray-500">
            Participant management functionality will be added soon
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Participants;