"use client";

import * as React from "react";
import {
  Bell,
  Eye,
  Search,
  Users,
  Home,
  Settings,
  CreditCard,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import CircularProgress from "./ui/circular";
import { cn } from "@/lib/utils";
import AdminSidebar from "./sidebar/adminSidebar";
import Infobar from "./infobar/infobar";
import Stats from "./cards/stats";
import DateFilters from "./filters/date-filters";
import OrganizationTable from "./tables/organizationTable";
import axios from "axios";

type Task = {
  createdAt: Date; // or Date, depending on your data format
  status: string;
};

type Organization = {
  createdAt: Date; // or Date
  companyName: string;
  isPro: boolean;
  subscriptionExpires?: string;
  trialExpires?: string;
  tasks?: string;
  users?: string;
};

type User = {
  createdAt: Date; // or Date
};

type AdminSidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

function Dashboard({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {


  const timeFilters = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "This Year",
    "All Time",
    "Custom",
  ];

  const statusFilters = ["All", "Active", "Trial", "Trial Expired", "Expired"];
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = React.useState("All Time");
  const [useMockData, setUseMockData] = React.useState(true);
  const [allStatsData, setAllStatsData] = React.useState({
    organizations: [],
    tasks: [],
    users: [],
    summary: {
      totalTasksAcrossOrgs: 0,
      completedTasksAcrossOrgs: 0,
      totalOrganizations: 0,
      totalUsersAcrossOrgs: 0,
    }
  });

  const [filteredStatsData, setFilteredStatsData] = React.useState({
    totalTasks: 0,
    completedTasks: 0,
    totalOrganizations: 0,
    totalUsers: 0,
  });

  const mockStatsData = {
    totalTasks: 456983,
    completedTasks: 382927,
    totalOrganizations: 10559,
    totalUsers: 34899,
  };

  // const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [statsData, setStatsData] = React.useState(mockStatsData);

  const getDateRange = (filter: string) => {
    const today = new Date();
    let startDate, endDate;

    switch (filter) {
      case "Today":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "Yesterday":
        startDate = new Date(today.setDate(today.getDate() - 1));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "This Week":
        startDate = new Date(today.setDate(today.getDate() - today.getDay()));
        endDate = new Date();
        break;
      case "Last Week":
        startDate = new Date(today.setDate(today.getDate() - today.getDay() - 7));
        endDate = new Date(today.setDate(today.getDate() + 6));
        break;
      case "This Month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "Last Month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "This Year":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        return true;
    }
    return { startDate, endDate };
  };

  React.useEffect(() => {
    if (!useMockData) {
      axios
        .get("/api/organizations/tasks")
        .then((response) => {
          const { data, summary } = response.data;
          setAllStatsData({
            organizations: data.map((org: Organization) => ({ createdAt: org.createdAt })),
            tasks: data.flatMap((org: Organization) => org.tasks),
            users: data.flatMap((org: Organization) => org.users),
            summary,
          });

          setStatsData({
            totalTasks: summary.totalTasksAcrossOrgs,
            completedTasks: summary.completedTasksAcrossOrgs,
            totalOrganizations: summary.totalOrganizations,
            totalUsers: summary.totalUsersAcrossOrgs,
          });
        })
        .catch((error) => console.error("Error fetching stats data:", error));
    } else {
      setStatsData(mockStatsData);
    }
  }, [useMockData]);

  React.useEffect(() => {
    if (useMockData) return;

    const dateRange = getDateRange(selectedDateFilter);
    if (!dateRange || typeof dateRange !== "object") return;

    const { startDate, endDate } = dateRange;
    const isInDateRange = (createdAt: Date) => new Date(createdAt) >= startDate && new Date(createdAt) <= endDate;

    setStatsData({
      totalTasks: allStatsData.tasks.filter((task: Task) => isInDateRange(task.createdAt)).length,
      completedTasks: allStatsData.tasks.filter((task: Task) => task.status === "Completed" && isInDateRange(task.createdAt)).length,
      totalOrganizations: allStatsData.organizations.filter((org: Organization) => isInDateRange(org.createdAt)).length,
      totalUsers: allStatsData.users.filter((user: User) => isInDateRange(user.createdAt)).length,
    });
  }, [allStatsData, selectedDateFilter, useMockData]);

  return (
    <div className="flex min-h-screen mt-20 bg-[#f8f9fa]">
    {/* <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> */}

    {/* Main Content */}
    <div
      className={cn(
        "flex-1 transition-all duration-300",
        isCollapsed ? "ml-0" : "ml-64"
      )}
    >
      {/* <Infobar />a */}
      {/* Main Content */}
      <main className="p-6">
        {/* Stats */}
        <Stats statsData={statsData} />

        <DateFilters onDateFilterChange={setSelectedDateFilter} />

        {/* Status Filters */}
        <div className="">
          <div className="flex items-center mb-4 justify-between">
            <div className="flex gap-2 mt-12">
              {statusFilters.map((filter) => (
                <Button
                  key={filter}
                  variant={selectedStatusFilter === filter ? "default" : "ghost"}
                  onClick={() => setSelectedStatusFilter(filter)}
                  className={selectedStatusFilter === filter
                    ? "b text-xs h-7 text-white bg-[#5b46d9] hover:bg-[#4a3bb8]"
                    : "text-gray-600 h-7 border text-xs border-gray-300 hover:text-gray-700 hover:bg-gray-100"}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Reversed</span>
              <Switch />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mb-4">
            <Switch
              className="scale-75"
              checked={useMockData}
              onCheckedChange={() => setUseMockData(!useMockData)}
            />
          </div>
        </div>
        {/* Table */}
        <OrganizationTable statusFilter={selectedStatusFilter} useMockData={useMockData} />
      </main>
    </div>
  </div>
  );
}

export default Dashboard;
