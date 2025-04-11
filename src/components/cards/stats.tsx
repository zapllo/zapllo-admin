import React from "react";
import { Card, CardContent } from "../ui/card";

type StatsProps = {
  statsData: {
    totalTasks: number;
    completedTasks: number;
    totalOrganizations: number;
    totalUsers: number;
  };
};

export default function Stats({ statsData }: StatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card className="bg-white items-center flex h-32 rounded-2xl border border-gray-200 shadow-sm text-gray-800">
      <CardContent className="flex items-center gap-4 p-6 h-[142px]">
        <div className="rounded-full w-[82px] h-[82px] bg-purple-100 flex items-center justify-center">
          <img src="/tickboard.png" alt="Total Tasks Icon" className="" />
        </div>
        <div>
          <p className="text-sm text-[14px] font-medium text-gray-500">TOTAL TASKS</p>
          <p className="text-2xl font-bold text-gray-800">{(statsData.totalTasks || 0).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white flex items-center h-32 rounded-2xl border border-gray-200 shadow-sm text-gray-800">
      <CardContent className="flex items-center gap-4 p-6 h-[142px]">
        <div className="rounded-full w-[82px] h-[82px] bg-purple-100 flex items-center justify-center">
          <img src="/tickcircle.png" alt="Tasks Completed Icon" />
        </div>
        <div>
          <p className="text-sm text-[14px] font-medium text-gray-500">TASK COMPLETED</p>
          <p className="text-2xl font-bold text-gray-800">{(statsData.completedTasks || 0).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white h-32 flex items-center rounded-2xl border border-gray-200 shadow-sm text-gray-800">
      <CardContent className="flex items-center gap-4 p-6 h-[142px]">
        <div className="rounded-full w-[82px] h-[82px] bg-purple-100 flex items-center justify-center">
          <img src="/building.png" alt="Total Organizations Icon" />
        </div>
        <div>
          <p className="text-sm text-gray-500">TOTAL COMPANIES</p>
          <p className="text-2xl font-bold text-gray-800">{(statsData.totalOrganizations || 0).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white h-32 flex items-center rounded-2xl border border-gray-200 shadow-sm text-gray-800">
      <CardContent className="flex items-center gap-4 p-6 h-[142px]">
        <div className="rounded-full w-[82px] h-[82px] bg-purple-100 flex items-center justify-center">
          <img src="/group.png" alt="Total Users Icon" />
        </div>
        <div>
          <p className="text-sm text-gray-500">TOTAL USERS</p>
          <p className="text-2xl font-bold text-gray-800">{(statsData.totalUsers || 0).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  </div>
  );
}
