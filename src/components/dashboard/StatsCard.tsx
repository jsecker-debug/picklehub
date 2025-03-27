
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

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

export default StatsCard;
