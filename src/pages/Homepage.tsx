
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSessions";
import { getNextSession, getUpcomingSessions, getCompletedSessions } from "@/utils/sessionUtils";
import { useParticipants } from "@/hooks/useParticipants";
import { cn } from "@/lib/utils";
import { Participant } from "@/types/scheduler";
import SessionDetailDialog from "@/components/sessions/SessionDetailDialog";

const Homepage = () => {
  const { user } = useAuth();
  const { data: sessions, isLoading: isLoadingSessions } = useSessions();
  const { participants, isLoading: isLoadingParticipants } = useParticipants();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const nextSession = sessions ? getNextSession(sessions) : null;
  const recentSessions = sessions ? getCompletedSessions(sessions).slice(0, 3) : [];
  
  // Calculate player stats
  const totalPlayers = participants?.length || 0;
  const averageLevel = participants?.length 
    ? participants.reduce((sum, p) => sum + (p.level || 0), 0) / participants.length 
    : 0;

  const getTopPlayers = (participants: Participant[] | undefined): Participant[] => {
    if (!participants) return [];
    return [...participants]
      .sort((a, b) => (b.wins || 0) - (a.wins || 0))
      .slice(0, 5);
  };

  const topPlayers = getTopPlayers(participants);

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-5xl mx-auto py-4 sm:py-12 px-2 sm:px-6">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-primary font-anybody">Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">
            Welcome back, {user?.user_metadata?.name || 'Player'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatsCard 
            title="Total Players" 
            value={totalPlayers.toString()} 
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />} 
          />
          <StatsCard 
            title="Next Session" 
            value={nextSession ? format(new Date(nextSession.Date), 'MMM d') : 'None'} 
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />} 
          />
          <StatsCard 
            title="Sessions This Month" 
            value={sessions?.filter(s => {
              const sessionDate = new Date(s.Date);
              const today = new Date();
              return sessionDate.getMonth() === today.getMonth() && 
                     sessionDate.getFullYear() === today.getFullYear();
            }).length.toString() || '0'} 
            icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />} 
          />
          <StatsCard 
            title="Avg. Player Level" 
            value={averageLevel.toFixed(1)} 
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Next Session Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-xl">Next Session</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : nextSession ? (
                <div>
                  <div className="bg-gray-50 p-2 sm:p-4 rounded-lg mb-2 sm:mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{format(new Date(nextSession.Date), 'EEEE, MMMM d, yyyy')}</p>
                        <p className="text-gray-500 text-xs sm:text-sm">{nextSession.Venue}</p>
                      </div>
                      <span className={cn(
                        "px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs",
                        nextSession.Status === 'Upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      )}>
                        {nextSession.Status}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-1 sm:text-sm"
                    onClick={() => setSelectedSessionId(nextSession.id)}
                  >
                    View Session Details <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2 sm:py-6 text-sm sm:text-base text-gray-500">
                  No upcoming sessions
                  <div className="mt-2 sm:mt-4">
                    <Link to="/sessions">
                      <Button size="sm">Schedule a Session</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Players */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-xl">Top Players</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingParticipants ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : topPlayers.length > 0 ? (
                <div className="space-y-2">
                  {topPlayers.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-1.5 sm:p-2 border-b last:border-b-0">
                      <div className="flex items-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs mr-2">
                          {index + 1}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{player.name}</span>
                      </div>
                      <div className="text-xs sm:text-sm">
                        <span className="font-semibold">{player.wins || 0}</span>
                        <span className="text-gray-500"> wins</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 sm:py-4 text-sm text-gray-500">
                  No player data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <div className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-xl">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : recentSessions.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {recentSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex justify-between items-center p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedSessionId(session.id)}
                    >
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{format(new Date(session.Date), 'MMM d, yyyy')}</p>
                        <p className="text-gray-500 text-xs">{session.Venue}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs sm:text-sm p-1 sm:p-2 h-auto">
                        View <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 sm:py-4 text-sm text-gray-500">
                  No recent sessions
                </div>
              )}
              <div className="mt-3 sm:mt-4 text-center">
                <Link to="/sessions">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View All Sessions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Detail Dialog */}
        <SessionDetailDialog
          sessionId={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
          sessions={sessions}
        />
      </div>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, icon }: StatsCardProps) => (
  <Card>
    <CardContent className="p-3 sm:p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
          <p className="text-lg sm:text-xl font-bold mt-0.5 sm:mt-1">{value}</p>
        </div>
        <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Homepage;
