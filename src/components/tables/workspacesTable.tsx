"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import DateFilters from "../filters/date-filters";

interface Organization {
    _id: string;
    companyName: string;
    orgAdmin: string;
    email: string;
    whatsappNo: string;
    trialExpires: Date;
    isPro?: boolean;
    subscriptionExpires?: Date;
}

type AdminSidebarProps = {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function WorkspacesTable({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
    const [statusFilter, setStatusFilter] = useState("All"); // Add filter state
    const [selectedDateFilter, setSelectedDateFilter] = useState("All Time"); // Add selected date filter state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [extensionDays, setExtensionDays] = useState<number | undefined>();

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const res = await fetch("/api/organizations/admin");
                const data = await res.json();
                setOrganizations(data.data);
                setFilteredOrganizations(data.data); // Initialize filtered organizations
                setLoading(false);
            } catch (error: any) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, []);

    useEffect(() => {
        // Filter logic
        const today = new Date();

        // Filter by status
        let filteredData = organizations.filter((org) => {
            const trialExpires = new Date(org.trialExpires);
            const subscriptionExpires = org.subscriptionExpires ? new Date(org.subscriptionExpires) : null;

            switch (statusFilter) {
                case "Active":
                    return subscriptionExpires && subscriptionExpires > today;
                case "Trial":
                    return !org.isPro && trialExpires > today;
                case "Trial Expired":
                    return !org.isPro && trialExpires < today;
                case "Expired":
                    return subscriptionExpires && subscriptionExpires < today;
                default:
                    return true; // "All" filter
            }
        });

        // Filter by date range
        if (selectedDateFilter !== "All Time") {
            const dateRange = getDateRange(selectedDateFilter);
            if (dateRange) {
                const { startDate, endDate } = dateRange;
                filteredData = filteredData.filter((org) => {
                    const trialExpires = new Date(org.trialExpires);
                    return trialExpires >= startDate && trialExpires <= endDate;
                });
            }
        }

        setFilteredOrganizations(filteredData);
    }, [statusFilter, selectedDateFilter, organizations]);

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
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "This Week":
                startDate = new Date(today.setDate(today.getDate() - today.getDay()));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(today);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "Last Week":
                startDate = new Date(today.setDate(today.getDate() - today.getDay() - 7));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
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

    const handleDateFilterChange = (filter: string) => {
        setSelectedDateFilter(filter);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex min-h-screen mt-12 bg-[#04061e] text-white">
            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-0" : "ml-64")}>
                <main className="p-6">
                    <h1 className="text-center font-bold text-xl">Organizations</h1>

                    {/* Status Filter Buttons */}
                    <div className="flex space-x-4 my-4">
                        {["All", "Active", "Trial", "Trial Expired", "Expired"].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>

                    {/* Date Filters */}
                    <DateFilters onDateFilterChange={handleDateFilterChange} />

                    {/* Table Layout */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse border border-gray-800 text-sm">
                            <thead>
                                <tr className="bg-gray-900 text-left">
                                    <th className="border border-gray-800 px-4 py-2">Organization Name</th>
                                    <th className="border border-gray-800 px-4 py-2">Org Admin</th>
                                    <th className="border border-gray-800 px-4 py-2">Email</th>
                                    <th className="border border-gray-800 px-4 py-2">WhatsApp Number</th>
                                    <th className="border border-gray-800 px-4 py-2">Trial Expires</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrganizations.map((org) => (
                                    <tr key={org._id} className="hover:bg-gray-800">
                                        <td className="border border-gray-800 px-4 py-2">{org.companyName}</td>
                                        <td className="border border-gray-800 px-4 py-2">{org.orgAdmin || "No Admin"}</td>
                                        <td className="border border-gray-800 px-4 py-2">{org.email}</td>
                                        <td className="border border-gray-800 px-4 py-2">{org.whatsappNo}</td>
                                        <td className="border border-gray-800 px-4 py-2">{new Date(org.trialExpires).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}
