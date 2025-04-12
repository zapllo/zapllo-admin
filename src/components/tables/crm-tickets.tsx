"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Search, Calendar, Eye, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import Link from "next/link";

interface ICRMUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ICRMOrganization {
  _id: string;
  companyName: string;
}

interface ICRMMessage {
  sender: "user" | "agent";
  content: string;
  timestamp: string;
  agent?: string;
  attachments?: { name: string; url: string }[];
}

// The CRM ticket shape from /api/admin/tickets
interface ICRMTicket {
  _id: string;               // the MongoDB _id
  ticketId: string;          // e.g. "TKT-2023-XXXX-0001"
  subject: string;
  status: "open" | "pending" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  createdAt: string;
  updatedAt: string;
  userId: ICRMUser;
  organizationId: ICRMOrganization;
  assignedTo?: ICRMUser;
  messages?: ICRMMessage[];
}

type AdminSidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CRMTicketsTable({
  isCollapsed,
  setIsCollapsed,
}: AdminSidebarProps) {
  const router = useRouter();

  const [tickets, setTickets] = useState<ICRMTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<ICRMTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  // Fetch CRM tickets
  useEffect(() => {
    const fetchCRMTickets = async () => {
      try {
        setLoading(true);
        // Hit your new CRM endpoint
        const response = await axios.get("/api/crm-proxy/tickets");
        // Response shape: { tickets, pagination: {...} }
        setTickets(response.data.tickets);
        setFilteredTickets(response.data.tickets);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load CRM tickets:", err);
        setLoading(false);
      }
    };

    fetchCRMTickets();
  }, []);

  // Filtering by search query & “activeOnly”
  useEffect(() => {
    let results = [...tickets];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((ticket) => {
        const userName =
          ticket.userId &&
          (ticket.userId.firstName + " " + ticket.userId.lastName).toLowerCase();
        const userEmail = ticket.userId?.email?.toLowerCase() || "";
        const subject = ticket.subject.toLowerCase();

        return (
          userName?.includes(query) ||
          userEmail.includes(query) ||
          subject.includes(query) ||
          ticket.ticketId.toLowerCase().includes(query)
        );
      });
    }

    // Filter by "active only"
    if (activeOnly) {
      // e.g. show only open/pending
      results = results.filter(
        (ticket) => ticket.status === "open" || ticket.status === "pending"
      );
    }

    setFilteredTickets(results);
  }, [searchQuery, activeOnly, tickets]);

  const handleViewDetails = (ticket: ICRMTicket) => {
    // navigate to the CRM details page
    // e.g. /crm-tickets/[id] – you’ll create that route below
    router.push(`/crm-tickets/${ticket.ticketId}`);
  };

  // status color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Open
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Pending
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Closed
          </Badge>
        );
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
          <Tabs defaultValue="crm" className="w-full mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger value="support">
                <Link href="/tickets" className="flex items-center">
                  Support Tickets <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </TabsTrigger>
              <TabsTrigger value="crm">CRM Tickets</TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Header controls, search, etc. */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8 mb-6">
            <div className="relative w-full sm:w-auto flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search CRM tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-[#5b46d9] focus:border-[#5b46d9]"
              />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Active only</span>
                <Switch
                  checked={activeOnly}
                  onCheckedChange={(val) => setActiveOnly(val)}
                  className="data-[state=checked]:bg-[#5b46d9]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading CRM tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No CRM tickets found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-800">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Requester</th>
                      <th className="py-3 px-4">Organization</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Created At</th>
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

                        <td className="py-3 px-4">{ticket.ticketId}</td>

                        <td className="py-3 px-4">{ticket.subject}</td>

                        <td className="py-3 px-4">
                          {ticket.userId
                            ? `${ticket.userId.firstName} ${ticket.userId.lastName}`
                            : "N/A"}
                        </td>

                        <td className="py-3 px-4">
                          {ticket.organizationId?.companyName || "N/A"}
                        </td>

                        <td className="py-3 px-4">{ticket.category}</td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                            <span>{dayjs(ticket.createdAt).format("MMM DD, YYYY")}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">{getStatusBadge(ticket.status)}</td>

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
}
