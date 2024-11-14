import React, { useEffect, useState } from "react";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CircularProgress from "@/components/ui/circular";

type Organization = {
  rank: number;
  name: string;
  owner?: string;
  isPro?: boolean;
  totalTasks?: number | string;
  maxTasks?: string;
  completion?: number;
  taskUsers?: string;
  subscribers?: string;
  maxSubscribers?: string;
  renewalDate?: string;
  trialExpires?: string;
  subscriptionExpires?: string;
};

const mockData: Organization[] = [
  {
    rank: 1,
    name: "Finowlish",
    owner: "Saibal Bhaduri",
    totalTasks: 5236,
    maxTasks: "6841",
    completion: 55,
    taskUsers: "20 Users",
    subscribers: "20",
    maxSubscribers: "21",
    renewalDate: "May 10, 2025",
  },
  // More mock entries
];

type OrganizationTableProps = {
  statusFilter: string;
  useMockData: boolean;
};


export default function OrganizationTable({ statusFilter, useMockData }: OrganizationTableProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (!useMockData) {
      axios
        .get("/api/organizations/tasks")
        .then((response) => {
          const data = response.data.data.map((org: any) => ({
            rank: org.rank,
            name: org.companyName || "N/A",
            owner: org.orgAdmin || "N/A",
            totalTasks: org.totalTasks || "N/A",
            completion: org.completionPercentage || 0,
            taskUsers: org.orders.length > 0 ? org.orders[0].taskAccessCount : "N/A",
            subscribers: org.orders.length > 0 ? org.orders[0].subscribedUserCount : "N/A",
            maxSubscribers: org.orders.length > 0 ? org.orders[0].subscribedUserCount : "N/A",
            renewalDate: org.renewalDate || "N/A",
            isPro: org.isPro,
            subscriptionExpires: org.subscriptionExpires || "N/A",
            trialExpires: org.trialExpires || "N/A",
          }));
          setOrganizations(data);
        })
        .catch((error) => console.error("Error fetching organizations:", error));
    }
  }, [useMockData]);
  console.log(statusFilter, 'filter check')

  // Filter organizations based on status
  const filteredOrganizations = organizations.filter((org) => {
    const today = new Date();
    const subscriptionExpires = org.subscriptionExpires ? new Date(org.subscriptionExpires) : null;
    const trialExpires = org.trialExpires ? new Date(org.trialExpires) : null;

    switch (statusFilter) {
      case "Active":
        return org.isPro === true;
      case "Trial":
        return !org.isPro && trialExpires && trialExpires > today;
      case "Trial Expired":
        return !org.isPro && trialExpires && trialExpires < today;
      case "Expired":
        return subscriptionExpires && subscriptionExpires < today;
      default:
        return true; // "All" filter
    }
  });


  const displayedData = useMockData ? mockData : filteredOrganizations;

  return (
    <div className="rounded-lg border border-gray-800 bg-[#04061e] p-4">

      <Table>
        <TableHeader>
          <TableRow className="h-[58px] border-gray-800 hover:bg-gray-900">
            <TableHead className="text-gray-400">RANK</TableHead>
            <TableHead className="text-gray-400">COMPANY NAME</TableHead>
            <TableHead className="text-gray-400">OWNER</TableHead>
            <TableHead className="text-gray-400">TOTAL TASKS</TableHead>
            <TableHead className="text-gray-400">COMPLETION</TableHead>
            <TableHead className="text-gray-400">TASK USERS</TableHead>
            <TableHead className="text-gray-400">SUBSCRIBERS</TableHead>
            <TableHead className="text-gray-400">RENEWAL DATE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedData.map((org, index) => (
            <TableRow key={index} className="border-gray-800 h-[64px] hover:bg-gray-800/50">
              <TableCell>
                {org.rank <= 3 ? (
                  <img src={`/${["first", "second", "third"][org.rank - 1]}.png`} alt="Rank Badge" />
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                    {org.rank || "N/A"}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium text-white">{org.name}</div>
              </TableCell>
              <TableCell className="text-gray-400">{org.owner || "N/A"}</TableCell>
              <TableCell className="text-gray-400">{org.totalTasks || "N/A"}</TableCell>
              <TableCell>
                {org.completion !== undefined ? (
                  <CircularProgress value={org.completion} />
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </TableCell>
              <TableCell className="text-gray-400">{org.taskUsers || "N/A"}</TableCell>
              <TableCell className="text-gray-400">
                <span className="text-white">{org.subscribers || "N/A"}</span>
                <span className="text-gray-400"> / {org.maxSubscribers || "N/A"}</span>
              </TableCell>
              <TableCell className="text-white">{org.renewalDate || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
