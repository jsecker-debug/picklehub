
import React from "react";

interface DashboardHeaderProps {
  userName: string | undefined;
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <div className="mb-4 sm:mb-8">
      <h1 className="text-xl sm:text-3xl font-bold text-primary font-anybody">Dashboard</h1>
      <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">
        Welcome back, {userName || 'Player'}
      </p>
    </div>
  );
};

export default DashboardHeader;
