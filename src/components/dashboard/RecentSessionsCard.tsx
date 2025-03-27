
import React from "react";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Session } from "@/hooks/useSessions";

interface RecentSessionsCardProps {
  recentSessions: Session[];
  isLoading: boolean;
  onViewSession: (id: string) => void;
}

const RecentSessionsCard = ({ recentSessions, isLoading, onViewSession }: RecentSessionsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-xl">Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : recentSessions.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {recentSessions.map((session) => (
              <div 
                key={session.id} 
                className="flex justify-between items-center p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => onViewSession(session.id)}
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
  );
};

export default RecentSessionsCard;
