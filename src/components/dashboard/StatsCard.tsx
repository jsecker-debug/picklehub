
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatsCard = ({ title, value, icon, isLoading = false }: StatsCardProps) => (
  <Card>
    <CardContent className="p-3 sm:p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
          {isLoading ? (
            <Skeleton className="h-5 w-20 mt-0.5 sm:mt-1" />
          ) : (
            <p className="text-lg sm:text-xl font-bold mt-0.5 sm:mt-1">{value}</p>
          )}
        </div>
        <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StatsCard;
