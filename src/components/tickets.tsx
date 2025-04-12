'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Eye, Search, Filter, Calendar, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import TicketStats from "./cards/ticketStats";
import DateFilters from "./filters/date-filters";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import Link from "next/link";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSpecificStatuses, setShowSpecificStatuses] = useState<boolean>(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState("All Time");
  const router = useRouter();

  // Fetch tickets only after the client has mounted
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const filterTickets = () => {
      let filtered = tickets;

      // Filter by search query
      if (searchQuery.trim()) {
        filtered = filtered.filter((ticket) =>
          ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Resolved</Badge>;
      case "Pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
      case "In Resolution":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">In Resolution</Badge>;
      case "Over Due":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Over Due</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen mt-12 bg-[#f8f9fa]">
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "ml-0" : "ml-64"
        )}
      >
        <main className="p-6">
        <Tabs defaultValue="support" className="w-full mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger value="support">Support Tickets</TabsTrigger>
              <TabsTrigger value="crm">
                <Link href="/crm-tickets" className="flex items-center">
                  CRM Tickets <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <TicketStats
            statsData={{
              totalTickets: tickets.length,
              resolvedTickets: tickets.filter((ticket) => ticket.status === "Resolved").length,
              pendingTickets: tickets.filter((ticket) => ticket.status === "Pending").length,
              inResolutionTickets: tickets.filter((ticket) => ticket.status === "In Resolution").length,
            }}
          />

          <DateFilters onDateFilterChange={setSelectedDateFilter} />

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8 mb-6">
            <div className="relative w-full sm:w-auto flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search tickets by email, name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-[#5b46d9] focus:border-[#5b46d9]"
              />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Active tickets only</span>
                <Switch
                  id="status-switch"
                  checked={showSpecificStatuses}
                  onCheckedChange={setShowSpecificStatuses}
                  className="data-[state=checked]:bg-[#5b46d9]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No tickets found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-800">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Organization</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 hidden md:table-cell">Subcategory</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets?.map((ticket, index) => (
                      <tr
                        key={ticket._id}
                        className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{ticket?.user?.firstName} {ticket?.user?.lastName}</div>
                          <div className="text-gray-500 text-xs">{ticket?.user?.email}</div>
                        </td>
                        <td className="py-3 px-4">{ticket?.user?.organization.companyName}</td>
                        <td className="py-3 px-4">{ticket?.category}</td>
                        <td className="py-3 px-4 hidden md:table-cell">{ticket?.subcategory}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                            <span>{dayjs(ticket.createdAt).format("MMM DD, YYYY")}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            onClick={() => handleViewDetails(ticket)}
                            variant="ghost"
                            size="sm"
                            className="text-[#5b46d9] hover:bg-[#5b46d9]/10 rounded-full p-2 h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TicketsTable;
