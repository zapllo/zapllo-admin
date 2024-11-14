'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs"; // For date formatting
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import TicketStats from "./cards/ticketStats";
import DateFilters from "./filters/date-filters";


// Interface for the User object (based on your user model)
interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    organization: IOrganization;
}

// Interface for the Organization object
interface IOrganization {
    _id: string;
    companyName: string;
}

// Interface for the Ticket object (based on your ticket model)
interface ITicket {
    _id: string;
    category: string;
    subcategory: string;
    user: IUser; // Referencing the User interface
    subject: string;
    description: string;
    fileUrl?: string[];
    createdAt: Date;
    updatedAt: Date;
    comments: IComment[];
    status: string;
}

// Interface for the Comment object (based on your ticket model)
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
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalTickets: 0,
        resolvedTickets: 0,
        pendingTickets: 0,
        inResolutionTickets: 0,
    });
    const [selectedDateFilter, setSelectedDateFilter] = useState("All Time")
    const router = useRouter();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get("/api/tickets/all");
                console.log(response, 'tickets?')
                setTickets(response.data.tickets);
                setFilteredTickets(response.data.tickets);
                setStats(response.data.stats);
                setLoading(false);
            } catch (err) {
                setError("Failed to load tickets");
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);


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
                endDate = today;
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
                return null;
        }
        return { startDate, endDate };
    };

    useEffect(() => {
        const dateRange = getDateRange(selectedDateFilter);
        if (!dateRange) {
            setFilteredTickets(tickets);
            return;
        }

        const { startDate, endDate } = dateRange;
        const isInDateRange = (date: Date) => new Date(date) >= startDate && new Date(date) <= endDate;

        const filtered = tickets.filter(ticket => isInDateRange(ticket.createdAt));
        setFilteredTickets(filtered);

        // Update stats based on filtered tickets
        setStats({
            totalTickets: filtered.length,
            resolvedTickets: filtered.filter(ticket => ticket.status === "Resolved").length,
            pendingTickets: filtered.filter(ticket => ticket.status === "Pending").length,
            inResolutionTickets: filtered.filter(ticket => ticket.status === "In Resolution").length,
        });
    }, [tickets, selectedDateFilter]);

    const handleViewDetails = (ticket: ITicket) => {
        router.push(`/tickets/${ticket._id}`);
    };

    return (
        <div className="flex min-h-screen mt-12 bg-[#04061e] ">
            {/* <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> */}

            {/* Main Content */}
            <div
                className={cn(
                    "flex-1 transition-all  duration-300",
                    isCollapsed ? "ml-0" : "ml-64"
                )}
            >
                {/* <Infobar />a */}
                {/* Main Content */}
                <main className="p-6  ">
                    <TicketStats statsData={stats} />
                    <DateFilters onDateFilterChange={setSelectedDateFilter} />

                    <div className="overflow-x-auto rounded-xl mt-4 border border-gray-700">
                        <table className="min-w-full   text-white">
                            <thead className="">
                                <tr className="text-left  text-sm border rounded-xl  border-gray-700">
                                    <th className="py-2 px-4">S.No</th>
                                    <th className="py-2 px-4">User Name</th>
                                    <th className="py-2 px-4">Organization Name</th>
                                    <th className="py-2 px-4">Category</th>
                                    <th className="py-2 px-4">Subcategory</th>
                                    <th className="py-2 px-4">Date</th>
                                    <th className="py-2 px-4">Due Date</th>
                                    <th className="py-2 px-4">Status</th>
                                    <th className="py-2 px-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets?.map((ticket, index) => (
                                    <tr key={ticket._id} className="border text-sm border-gray-700">
                                        <td className="py-2 px-4">{index + 1}</td>
                                        <td className="py-2 px-4">
                                            {ticket?.user?.firstName} {ticket?.user?.lastName}
                                        </td>
                                        <td className="py-2 px-4">{ticket?.user?.organization?.companyName}</td>
                                        <td className="py-2 px-4">{ticket?.category}</td>
                                        <td className="py-2 px-4">{ticket?.subcategory}</td>
                                        <td className="py-2 px-4">{dayjs(ticket?.createdAt).format('MMM DD, YYYY')}</td>
                                        <td className="py-2 px-4">{dayjs(ticket?.createdAt).add(1, 'day').format('MMM DD, YYYY')}</td>
                                        <td className={`py-2 px-4 ${ticket?.status === "Over Due" ? "text-red-500" : "text-green-500"}`}>
                                            {ticket.status}
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                            <button onClick={() => handleViewDetails(ticket)} className="text-blue-500 hover:underline">
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
