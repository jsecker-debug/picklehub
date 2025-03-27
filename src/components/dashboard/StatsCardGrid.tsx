
import React from "react";
import { Users, Calendar, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import StatsCard from "./StatsCard";
import type { Session } from "@/hooks/useSessions";

interface StatsCardGridProps {
  totalPlayers: number;
  nextSession: Session | null;
  sessionsThisMonth: number;
  averageLevel: number;
  isLoading: boolean;
}

const StatsCardGrid = ({ 
  totalPlayers, 
  nextSession, 
  sessionsThisMonth, 
  averageLevel,
  isLoading
}: StatsCardGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <StatsCard 
        title="Total Players" 
        value={totalPlayers.toString()} 
        icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />} 
        isLoading={isLoading}
      />
      <StatsCard 
        title="Next Session" 
        value={nextSession ? format(new Date(nextSession.Date), 'MMM d') : 'None'} 
        icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />} 
        isLoading={isLoading}
      />
      <StatsCard 
        title="Sessions This Month" 
        value={sessionsThisMonth.toString()} 
        icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />} 
        isLoading={isLoading}
      />
      <StatsCard 
        title="Avg. Player Level" 
        value={averageLevel.toFixed(1)} 
        icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatsCardGrid;
