
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { Session } from "@/hooks/useSessions";

interface SessionCardProps {
  title: string;
  sessions: Session[] | undefined;
  onSessionClick: (sessionId: string) => void;
}

const SessionCard = ({ title, sessions, onSessionClick }: SessionCardProps) => (
  <Card className="p-6 mb-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {sessions && sessions.length > 0 ? (
      <div className="space-y-4">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className="flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => onSessionClick(session.id)}
          >
            <div>
              <p className="font-medium">{format(new Date(session.Date), 'PPP')}</p>
              <p className="text-gray-500">{session.Venue}</p>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm",
              session.Status === 'Upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            )}>
              {session.Status}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center text-gray-500">
        No {title.toLowerCase()} sessions found.
      </div>
    )}
  </Card>
);

export default SessionCard;
