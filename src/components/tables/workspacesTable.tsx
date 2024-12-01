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
    const [extendOpen, setExtendOpen] = useState(false);

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


    const extendTrialPeriod = async (organizationId: any) => {
        try {
            const newTrialPeriod = new Date();
            newTrialPeriod.setMonth(newTrialPeriod.getMonth() + 1); // Extend by 1 month

            const res = await fetch('/api/organization/admin', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId, extensionDays }),
            });
            const data = await res.json();

            if (data.error) {
                alert(data.error);
            } else {
                alert('Trial period extended successfully');
                // Optionally, refetch organizations to update the UI
                // fetchOrganizations();
                setOrganizations((prevOrganizations: any) =>
                    prevOrganizations.map((org: any) =>
                        org._id === organizationId ? { ...org, trialExpires: data.data.trialExpires } : org
                    )
                );
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    const revokeTrialPeriod = async (organizationId: any) => {
        try {
            const res = await fetch('/api/organizations/admin', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId, revoke: true }),
            });
            const data = await res.json();

            if (data.error) {
                alert(data.error);
            } else {
                alert('Trial period revoked successfully');
                setOrganizations((prevOrganizations: any) =>
                    prevOrganizations.map((org: any) =>
                        org._id === organizationId ? { ...org, trialExpires: data.data.trialExpires } : org
                    )
                );
            }
        } catch (error: any) {
            alert(error.message);
        }
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
                                className={statusFilter === status ? "b  text-xs h-7 text-white bg-[#815bf5] hover:bg-[#815bf5]" : "text-gray-400 h-7 border text-xs border-gray-700 hover:text-gray-400 hover:bg-transparent"}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>

                    {/* Date Filters */}
                    <DateFilters onDateFilterChange={handleDateFilterChange} />

                    {/* Table Layout */}
                    <div className="overflow-x-auto border  rounded-xl border-gray-800 mt-4">
                        <table className="min-w-full  table-auto border-collapse rounded-xl  border-gray-800 text-xs">
                            <thead>
                                <tr className="text-left border-b rounded-xl border-gray-800">
                                    <th className=" border-gray-800 px-4 py-2">Organization Name</th>
                                    <th className=" border-gray-800 px-4 py-2">Org Admin</th>
                                    <th className=" border-gray-800 px-4 py-2">Email</th>
                                    <th className=" border-gray-800 px-4 py-2">WhatsApp Number</th>
                                    <th className=" border-gray-800 px-4 py-2">Trial Expires</th>
                                    <th className=" border-gray-800 px-4 py-2">Action</th>

                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrganizations.map((org) => (

                                    <tr key={org._id} className="border-b border-gray-800">
                                        <td className=" border-gray-800 px-4 py-2">{org.companyName}</td>
                                        <td className=" border-gray-800 px-4 py-2">{org.orgAdmin || "No Admin"}</td>
                                        <td className=" border-gray-800 px-4 py-2">{org.email}</td>
                                        <td className=" border-gray-800 px-4 py-2">{org.whatsappNo}</td>
                                        <td className=" border-gray-800 px-4 py-2">{new Date(org.trialExpires).toLocaleDateString()}</td>
                                        <td className="">
                                            <div className='space-x-2 p-2 flex'>
                                                <Button
                                                    // onClick={() => extendTrialPeriod(org._id)}
                                                    onClick={() => setExtendOpen(true)}
                                                    className='bg-transparent border h-7 text-xs text-[#FC8929] border-[#FC8929]'
                                                >
                                                    Extend Days
                                                </Button>
                                                <Button onClick={() => revokeTrialPeriod(org._id)} variant="destructive" className="text-xs h-7 border bg-transparent text-[#815BF5] border-[#815BF5]">
                                                    Revoke Trial
                                                </Button>
                                            </div>
                                            <Dialog open={extendOpen} onOpenChange={() => setExtendOpen(false)}>
                                                <DialogContent className="p-6">
                                                    <div className="flex justify-center">
                                                        <img src="/extend.png" />

                                                    </div>
                                                    <h1 className="text-white text-center">Are you sure you want to extend your days? </h1>
                                                    <input type="text" className="bg-transparent text-white border outline-none p-2 rounded border-gray-800 " placeholder="Enter the days you want to extend" />
                                                    <Button
                                                        onClick={() => extendTrialPeriod(org._id)}
                                                        className='bg-transparent w-fit justify-center h-7 text-xs bg-[#815bf5] '
                                                    >
                                                        Extend Days
                                                    </Button>
                                                </DialogContent>

                                            </Dialog>
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
}
