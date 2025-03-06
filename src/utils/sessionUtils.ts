
import type { Session } from "@/hooks/useSessions";

export const getNextSession = (sessions: Session[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return sessions
    .filter(session => {
      const sessionDate = new Date(session.Date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= today;
    })
    .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())[0];
};

export const getUpcomingSessions = (sessions: Session[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextSession = getNextSession(sessions);
  
  return sessions
    .filter(session => {
      const sessionDate = new Date(session.Date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= today && (!nextSession || session.id !== nextSession.id);
    })
    .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
};

export const getCompletedSessions = (sessions: Session[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return sessions
    .filter(session => {
      const sessionDate = new Date(session.Date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate < today;
    })
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
};
