import React, { useEffect, useState } from "react";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CircularProgress from "@/components/ui/circular";
import { Eye } from "lucide-react";

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

const mockData: Organization[] = Array.from({ length: 100 }, () => {
  const companyNames = [
    "BrightWorks Solutions", "GreenWave Enterprises", "SwiftTech Innovations", "ClearPath Consulting",
    "PrimeEdge Solutions", "BlueSky Ventures", "AgriConnect Systems", "EcoTrail Solutions",
    "SparkDigital Services", "MetroLogistics", "AquaPure Industries", "NextGen Innovators",
    "UrbanSpaces Developers", "CraftLine Creations", "Skyline Solutions", "Quantum Dynamics",
    "SmartNest Tech", "VitalGrow AgriTech", "EcoShade Industries", "UrbanPulse Networks",
    "BrightStar Health", "SustainPro Solutions", "FlexiTech Systems", "QuickBooks Solutions",
    "DreamScape Interiors", "CoreLogic Enterprises", "TravelEase Services", "SmartTrack Systems",
    "UrbanCo Connect", "SwiftMove Logistics", "GlobalEdge Consulting", "FinFocus Solutions",
    "ClearView Media", "NeoPulse Innovations", "SureShield Security", "BrightLeaf Systems",
    "FastTrack Logistics", "AgroPro Solutions", "SkyHigh Adventures", "EcoNest Builders",
    "TechSphere Solutions", "EliteCare Health", "BrightFuture Consulting", "MetroMinds Tech",
    "PulseDrive Solutions", "EcoFusion Enterprises", "DynamicEdge Services", "SmartGrow AgriTech",
    "UrbanWaves Solutions", "HomeHaven Interiors", "NextVision Systems", "FlexiMove Logistics",
    "VitalNest Enterprises", "ClearTrack Systems", "SwiftLine Solutions", "DreamView Creations",
    "CorePulse Innovations", "GlobalPath Ventures", "SureStep Security", "BrightPeak Systems",
    "FastMove Services", "AgriSphere Innovations", "SkyVision Builders", "EcoNext Solutions",
    "TechTrack Systems", "BrightSolutions Consulting", "EliteMinds Enterprises", "MetroTrack Tech",
    "EcoPulse Industries", "DynamicGrow AgriTech", "UrbanLeaf Solutions", "HomePulse Interiors",
    "VisionNext Systems", "ClearMove Logistics", "FlexiGrow Enterprises", "VitalTrack Solutions",
    "SureLink Security", "BrightLine Systems", "FastPath Services", "AgriTrack Innovations",
    "SkyNest Builders", "EcoDrive Solutions", "TechNest Systems", "BrightCare Health",
    "ElitePath Consulting", "PulseTech Enterprises", "EcoMinds Industries", "DynamicMove AgriTech",
    "UrbanNest Solutions", "HomeEdge Interiors", "VisionSphere Systems", "FlexiCare Enterprises"
  ];

  const indianOwnerNames = [
    "Amit Gupta", "Rahul Sharma", "Priya Singh", "Ravi Kumar", "Anjali Verma", "Sanjay Mehta",
    "Neha Kapoor", "Kunal Malhotra", "Ritika Bansal", "Arun Nair", "Sneha Joshi", "Deepak Chopra",
    "Kiran Desai", "Akshay Agarwal", "Nisha Jain", "Varun Reddy", "Megha Das", "Rohan Iyer",
    "Pooja Kulkarni", "Vivek Sinha", "Manisha Patil", "Siddharth Chawla", "Rajesh Rao",
    "Ritu Malhotra", "Shweta Bhatia", "Naveen Tiwari", "Gaurav Saxena", "Preeti Mishra",
    "Aditya Narayan", "Ankita Gupta", "Vikas Dubey", "Krishna Sharma", "Madhuri Reddy",
    "Arvind Patel", "Komal Arora", "Prateek Bhardwaj", "Ishita Roy", "Suresh Menon", "Rina Ghosh"
  ];

  const totalTasks = Math.floor(Math.random() * 10000); // Random total tasks
  const maxSubscribers = Math.max(20, Math.floor(totalTasks * 0.01)); // Base max subscribers on total tasks
  const subscribers = Math.max(20, Math.floor(maxSubscribers * 0.8)); // Between 80% of maxSubscribers
  const taskUsers = `${Math.min(subscribers, Math.max(10, Math.floor(totalTasks * 0.05)))} Users`; // 5% of totalTasks, capped by subscribers
  return {
    rank: 0,
    name: companyNames[Math.floor(Math.random() * companyNames.length)],
    owner: indianOwnerNames[Math.floor(Math.random() * indianOwnerNames.length)],
    totalTasks,
    maxTasks: `${Math.floor(Math.random() * 5000 + 5000)}`,
    completion: Math.floor(Math.random() * 100),
    taskUsers,
    subscribers: `${subscribers}`,
    maxSubscribers: `${maxSubscribers}`,
    renewalDate: new Date(
      Date.now() + Math.random() * 31536000000
    ).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    isPro: Math.random() > 0.5,
    subscriptionExpires: new Date(
      Date.now() + Math.random() * 31536000000
    ).toISOString(),
    trialExpires: new Date(
      Date.now() + Math.random() * 31536000000
    ).toISOString(),
  };
});

// Sort the data by totalTasks in descending order and assign ranks
const sortedMockData = mockData
  .sort((a, b) => {
    const totalTasksB = Number(b.totalTasks) || 0; // Ensure `b.totalTasks` is a number
    const totalTasksA = Number(a.totalTasks) || 0; // Ensure `a.totalTasks` is a number
    return totalTasksB - totalTasksA;
  })
  .map((item, index) => ({
    ...item,
    rank: index + 1, // Assign rank based on sorted order
    completion: index < 30
      ? Math.floor(Math.random() * 6) + 85 // Top 30: 85-90%
      : Number(item.completion) || 0 // Ensure completion is a number, fallback to 0 if undefined
  }));


// console.log(sortedMockData);






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


  const displayedData = useMockData ? sortedMockData : filteredOrganizations;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="h-[58px] border-gray-100 hover:bg-gray-50">
            <TableHead className="text-gray-600">RANK</TableHead>
            <TableHead className="text-gray-600">COMPANY NAME</TableHead>
            <TableHead className="text-gray-600">OWNER</TableHead>
            <TableHead className="text-gray-600">TOTAL TASKS</TableHead>
            <TableHead className="text-gray-600">COMPLETION</TableHead>
            <TableHead className="text-gray-600">TASK USERS</TableHead>
            <TableHead className="text-gray-600">SUBSCRIBERS</TableHead>
            <TableHead className="text-gray-600">RENEWAL DATE</TableHead>
            <TableHead className="text-gray-600">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedData.map((org, index) => (
            <TableRow key={index} className="border-gray-100 h-[64px] hover:bg-gray-50">
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
                <div className="font-medium text-gray-900">{org.name}</div>
              </TableCell>
              <TableCell className="text-gray-600">{org.owner || "N/A"}</TableCell>
              <TableCell className="text-gray-600">{org.totalTasks || "N/A"}</TableCell>
              <TableCell>
                {org.completion !== undefined ? (
                  <CircularProgress value={org.completion} />
                ) : (
                  <span className="text-gray-600">N/A</span>
                )}
              </TableCell>
              <TableCell className="text-gray-600">{org.taskUsers || "N/A"}</TableCell>
              <TableCell className="text-gray-600">
                <span className="text-gray-800">{org.subscribers || "N/A"}</span>
                <span className="text-gray-600"> / {org.maxSubscribers || "N/A"}</span>
              </TableCell>
              <TableCell className="text-gray-800">{org.renewalDate || "N/A"}</TableCell>
              <TableCell className="text-gray-800">
                <button className="text-[#5b46d9] hover:underline">
                  <Eye />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
