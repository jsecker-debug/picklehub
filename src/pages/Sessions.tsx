
import { useState } from "react";
import { useSessions } from "@/hooks/useSessions";
import { getNextSession, getUpcomingSessions, getCompletedSessions } from "@/utils/sessionUtils";
import SessionCard from "@/components/sessions/SessionCard";
import AddSessionDialog from "@/components/sessions/AddSessionDialog";
import SessionDetailDialog from "@/components/sessions/SessionDetailDialog";

const Sessions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  const { data: sessions, isLoading, error } = useSessions();

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  if (error) {
    return <div className="container mx-auto p-6">Error loading sessions</div>;
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-full mx-auto py-20 px-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary font-anybody">Sessions</h1>
            <p className="text-gray-600 mt-2">Manage your pickleball sessions</p>
          </div>
          <AddSessionDialog 
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading sessions...</div>
        ) : sessions ? (
          <>
            <SessionCard 
              title="Next Session" 
              sessions={getNextSession(sessions) ? [getNextSession(sessions)!] : []} 
              onSessionClick={handleSessionClick}
            />
            <SessionCard 
              title="Upcoming Sessions" 
              sessions={getUpcomingSessions(sessions)} 
              onSessionClick={handleSessionClick}
            />
            <SessionCard 
              title="Completed Sessions" 
              sessions={getCompletedSessions(sessions)} 
              onSessionClick={handleSessionClick}
            />

            <SessionDetailDialog
              sessionId={selectedSessionId}
              onClose={() => setSelectedSessionId(null)}
              sessions={sessions}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Sessions;
