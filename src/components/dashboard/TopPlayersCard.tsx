
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Participant } from "@/types/scheduler";

interface TopPlayersCardProps {
  topPlayers: Participant[];
  isLoading: boolean;
}

const TopPlayersCard = ({ topPlayers, isLoading }: TopPlayersCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-xl">Top Players</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
  );
};

export default TopPlayersCard;
