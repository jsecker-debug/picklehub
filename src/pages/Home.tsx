
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";

const Home = () => {
  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-4xl mx-auto py-20 px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">Welcome to <span className="font-emblema-one">DINK</span></h1>
          <p className="text-gray-600 mt-4 text-lg">
            Your complete solution for managing pickleball sessions and schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link to="/scheduler" className="block">
            <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg text-center">
              Scheduler
            </button>
          </Link>
          <Link to="/participants" className="block">
            <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg text-center">
              Participants
            </button>
          </Link>
          <Link to="/sessions" className="block">
            <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg text-center">
              Sessions
            </button>
          </Link>
        </div>

        <div className="space-y-0">
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium">Create a Session</p>
                  <p className="text-gray-600">Start by creating a new session in the {" "}
                    <Link to="/sessions" className="text-primary hover:underline">Sessions</Link> page. 
                    Choose your date and venue.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium">Generate Schedule</p>
                  <p className="text-gray-600">Use the {" "}
                    <Link to="/scheduler" className="text-primary hover:underline">Scheduler</Link> to 
                    generate game rotations and save them to your session.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium">Manage Players</p>
                  <p className="text-gray-600">Add and manage your players in the {" "}
                    <Link to="/participants" className="text-primary hover:underline">Participants</Link> page.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                <div>
                  <p className="font-medium">Edit Positions</p>
                  <p className="text-gray-600">During the session, you can adjust player positions in the {" "}
                    <Link to="/sessions" className="text-primary hover:underline">Sessions</Link> page.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
                <div>
                  <p className="font-medium">Record Results</p>
                  <p className="text-gray-600">After the session, update the scores and results in the {" "}
                    <Link to="/sessions" className="text-primary hover:underline">Sessions</Link> page.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Link to="/sessions">
            <GradientButton className="w-full py-6">
              <span className="flex items-center justify-center gap-2 text-lg font-medium">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </span>
            </GradientButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
