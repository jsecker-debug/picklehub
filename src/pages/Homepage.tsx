
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSessions";
import { useParticipants } from "@/hooks/useParticipants";
import { getNextSession, getCompletedSessions } from "@/utils/sessionUtils";
import { Participant } from "@/types/scheduler";
import SessionDetailDialog from "@/components/sessions/SessionDetailDialog";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCardGrid from "@/components/dashboard/StatsCardGrid";
import NextSessionCard from "@/components/dashboard/NextSessionCard";
import TopPlayersCard from "@/components/dashboard/TopPlayersCard";
import RecentSessionsCard from "@/components/dashboard/RecentSessionsCard";

const Homepage = () => {
  const { user } = useAuth();
  const { data: sessions, isLoading: isLoadingSessions } = useSessions();
  const { data: participants, isLoading: isLoadingParticipants } = useParticipants();
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
      .sort((a, b) => ((b.wins || 0) - (a.wins || 0)))
      .slice(0, 5);
  };

  const topPlayers = getTopPlayers(participants);

  // Calculate sessions this month
  const sessionsThisMonth = sessions?.filter(s => {
    const sessionDate = new Date(s.Date);
    const today = new Date();
    return sessionDate.getMonth() === today.getMonth() && 
           sessionDate.getFullYear() === today.getFullYear();
  }).length || 0;

  // Adding console logs for debugging
  console.log("User data:", user);
  console.log("Sessions:", sessions);
  console.log("Participants:", participants);
  console.log("Next session:", nextSession);
  console.log("Top players:", topPlayers);

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-5xl mx-auto py-4 sm:py-12 px-2 sm:px-6">
        {/* Dashboard Header */}
        <DashboardHeader userName={user?.user_metadata?.name} />

        {/* Stats Cards */}
        <StatsCardGrid 
          totalPlayers={totalPlayers}
          nextSession={nextSession}
          sessionsThisMonth={sessionsThisMonth}
          averageLevel={averageLevel}
          isLoading={isLoadingSessions || isLoadingParticipants}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Next Session Card */}
          <NextSessionCard 
            nextSession={nextSession} 
            isLoading={isLoadingSessions} 
            onViewDetails={setSelectedSessionId} 
          />

          {/* Top Players */}
          <TopPlayersCard 
            topPlayers={topPlayers} 
            isLoading={isLoadingParticipants} 
          />
        </div>

        {/* Recent Sessions */}
        <div className="mt-4 sm:mt-6">
          <RecentSessionsCard 
            recentSessions={recentSessions}
            isLoading={isLoadingSessions}
            onViewSession={setSelectedSessionId}
          />
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

export default Homepage;
