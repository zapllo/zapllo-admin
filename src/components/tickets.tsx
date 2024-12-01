'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import TicketStats from "./cards/ticketStats";
import DateFilters from "./filters/date-filters";
import { Switch } from "@/components/ui/switch";

// Interfaces for data
interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: IOrganization;
}

interface IOrganization {
  _id: string;
  companyName: string;
}

interface ITicket {
  _id: string;
  category: string;
  subcategory: string;
  user: IUser;
  subject: string;
  description: string;
  fileUrl?: string[];
  createdAt: Date;
  updatedAt: Date;
  comments: IComment[];
  status: string;
}

interface IComment {
  userId: string;
  content: string;
  fileUrls?: string[] | null;
  createdAt: Date;
}

type AdminSidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const TicketsTable = ({ isCollapsed, setIsCollapsed }: AdminSidebarProps) => {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(""); // For search input
  const [showSpecificStatuses, setShowSpecificStatuses] = useState<boolean>(false); // For status filtering switch
  const [selectedDateFilter, setSelectedDateFilter] = useState("All Time");
  const router = useRouter();

    // Fetch tickets only after the client has mounted
    useEffect(() => {
        if (typeof window !== "undefined") {
          const fetchTickets = async () => {
            try {
              const response = await axios.get("/api/tickets/all");
              setTickets(response.data.tickets);
              setFilteredTickets(response.data.tickets);
              setLoading(false);
            } catch (err) {
              console.error("Failed to load tickets:", err);
              setLoading(false);
            }
          };
          fetchTickets();
        }
      }, []);
    
  useEffect(() => {
    const filterTickets = () => {
      let filtered = tickets;

      // Filter by search query
      if (searchQuery.trim()) {
        filtered = filtered.filter((ticket) =>
          ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by specific statuses
      if (showSpecificStatuses) {
        filtered = filtered.filter(
          (ticket) => ticket.status === "Pending" || ticket.status === "In Resolution"
        );
      }

      setFilteredTickets(filtered);
    };

    filterTickets();
  }, [searchQuery, showSpecificStatuses, tickets]);

  const handleViewDetails = (ticket: ITicket) => {
    router.push(`/tickets/${ticket._id}`);
  };

  return (
    <div className="flex min-h-screen mt-12 bg-[#04061e] ">
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "ml-0" : "ml-64"
        )}
      >
        <main className="p-6">
          <TicketStats
            statsData={{
              totalTickets: tickets.length,
              resolvedTickets: tickets.filter((ticket) => ticket.status === "Resolved").length,
              pendingTickets: tickets.filter((ticket) => ticket.status === "Pending").length,
              inResolutionTickets: tickets.filter((ticket) => ticket.status === "In Resolution").length,
            }}
          />
          <DateFilters onDateFilterChange={setSelectedDateFilter} />

          <div className="flex items-center justify-between mt-4 mb-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-700 bg-[#0B0D29] text-white rounded px-4 py-2 w-1/3 focus:outline-none"
            />

            {/* Status Filter Switch */}
            <div className="flex items-center gap-2">
              <label htmlFor="status-switch" className="text-gray-400">
                Show Pending/In Resolution
              </label>
              <Switch
                id="status-switch"
                checked={showSpecificStatuses}
                onCheckedChange={setShowSpecificStatuses}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl mt-4 border border-gray-700">
            <table className="min-w-full text-white">
              <thead>
                <tr className="text-left text-sm border rounded-xl border-gray-700">
                  <th className="py-2 px-4">S.No</th>
                  <th className="py-2 px-4">User Name</th>
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">Organization Name</th>
                  <th className="py-2 px-4">Category</th>
                  <th className="py-2 px-4">Subcategory</th>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, index) => (
                  <tr key={ticket._id} className="border text-sm border-gray-700">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">
                      {ticket.user.firstName} {ticket.user.lastName}
                    </td>
                    <td className="py-2 px-4">{ticket.user.email}</td>
                    <td className="py-2 px-4">{ticket.user.organization.companyName}</td>
                    <td className="py-2 px-4">{ticket.category}</td>
                    <td className="py-2 px-4">{ticket.subcategory}</td>
                    <td className="py-2 px-4">
                      {dayjs(ticket.createdAt).format("MMM DD, YYYY")}
                    </td>
                    <td
                      className={`py-2 px-4 ${
                        ticket.status === "Over Due"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {ticket.status}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => handleViewDetails(ticket)}
                        className="text-blue-500 hover:underline"
                      >
                        <Eye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TicketsTable;
