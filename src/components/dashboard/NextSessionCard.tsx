
import React from "react";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Session } from "@/hooks/useSessions";

interface NextSessionCardProps {
  nextSession: Session | null;
  isLoading: boolean;
  onViewDetails: (id: string) => void;
}

const NextSessionCard = ({ nextSession, isLoading, onViewDetails }: NextSessionCardProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-xl">Next Session</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
              onClick={() => onViewDetails(nextSession.id)}
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
  );
};

export default NextSessionCard;
