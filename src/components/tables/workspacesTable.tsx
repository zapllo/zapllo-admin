"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import DateFilters from "../filters/date-filters";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Eye, Search, XCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

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
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedDateFilter, setSelectedDateFilter] = useState("All Time");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [extendOpen, setExtendOpen] = useState(false);
    const [revokeOpen, setRevokeOpen] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [selectedOrgName, setSelectedOrgName] = useState<string>("");
    const [extensionDays, setExtensionDays] = useState<number | undefined>();

    const router = useRouter();

    const handleExtendTrial = async () => {
        if (!selectedOrgId || !extensionDays) {
            toast.error("Please specify the number of days.");
            return;
        }

        try {
            const res = await fetch('/api/organizations/admin', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId: selectedOrgId, extensionDays }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to extend trial period.");
            }

            const data = await res.json();
            toast.success("Trial period extended successfully!");

            setOrganizations((prevOrganizations) =>
                prevOrganizations.map((org) =>
                    org._id === selectedOrgId ? { ...org, trialExpires: data.data.trialExpires } : org
                )
            );

            setExtendOpen(false);
            setExtensionDays(undefined);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Dialog open handler
    const openExtendDialog = (orgId: string, orgName: string) => {
        setSelectedOrgId(orgId);
        setSelectedOrgName(orgName);
        setExtendOpen(true);
    };

    // Dialog open handler
    const openRevokeDialog = (orgId: string, orgName: string) => {
        setSelectedOrgId(orgId);
        setSelectedOrgName(orgName);
        setRevokeOpen(true);
    };
    // Inside your component

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
        // Filter by search term
        if (searchTerm) {
            filteredData = filteredData.filter((org) =>
                [org.companyName, org.orgAdmin, org.email, org.whatsappNo]
                    .join(" ")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
        }
        setFilteredOrganizations(filteredData);
    }, [statusFilter, selectedDateFilter, organizations, searchTerm]);

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

            const res = await fetch('/api/organizations/admin', {
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

    const revokeTrialPeriod = async () => {
        if (!selectedOrgId) {
            toast.error("Please try revoking again!");
            return;
        }

        try {
            const res = await fetch('/api/organizations/admin', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId: selectedOrgId, revoke: true }),
            });
            const data = await res.json();

            if (data.error) {
                // alert(data.error);
            } else {
                toast.success('Trial period revoked successfully');
                setOrganizations((prevOrganizations: any) =>
                    prevOrganizations.map((org: any) =>
                        org._id === selectedOrgId ? { ...org, trialExpires: data.data.trialExpires } : org
                    )
                );
                setRevokeOpen(false);
            }
        } catch (error: any) {
            // alert(error.message);
        }
    };


    const getStatusBadge = (org: Organization) => {
        const today = new Date();
        const trialExpires = new Date(org.trialExpires);
        const subscriptionExpires = org.subscriptionExpires ? new Date(org.subscriptionExpires) : null;

        if (org.isPro && subscriptionExpires && subscriptionExpires > today) {
            return <Badge className="bg-green-100 text-green-800">Active</Badge>;
        } else if (!org.isPro && trialExpires > today) {
            return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
        } else if (!org.isPro && trialExpires < today) {
            return <Badge className="bg-amber-100 text-amber-800">Trial Expired</Badge>;
        } else if (subscriptionExpires && subscriptionExpires < today) {
            return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
        } else {
            return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
        }
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
            <div className="text-gray-600 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5b46d9] mb-3"></div>
                <p>Loading organizations...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
            <div className="text-red-600 bg-red-50 p-4 rounded-lg shadow">
                <p className="font-semibold">Error loading organizations</p>
                <p className="text-sm mt-1">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-3 bg-red-600 hover:bg-red-700">
                    Try Again
                </Button>
            </div>
        </div>
    );


    return (
        <div className="flex min-h-screen overflow-x-hidden w-full max-w-screen mt-12 bg-[#f8f9fa] text-gray-800">
            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-0" : "ml-64")}>
                <main className="p-6 w-[80%]">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Organizations</h1>

                    </div>


                    {/* Search Input */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search organizations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-gray-200 bg-white focus:ring-2 focus:ring-[#5b46d9] focus:border-[#5b46d9]"
                        />
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {["All", "Active", "Trial", "Trial Expired", "Expired"].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                onClick={() => setStatusFilter(status)}
                                className={statusFilter === status
                                    ? "text-xs h-8 text-white bg-[#5b46d9] hover:bg-[#4a3bb8]"
                                    : "text-black -600 h-8 border text-xs border-gray-300 hover:text-gray-800 hover:bg-gray-50"}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>

                    {/* Date Filters */}
                    <DateFilters onDateFilterChange={handleDateFilterChange} />

                    {/* Table Layout */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                        {filteredOrganizations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-100">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600">No organizations found</h3>
                                <p className="mt-1 text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y  divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial Expires</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrganizations.map((org) => (
                                            <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                            {org.companyName.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 hover:text-[#5b46d9] cursor-pointer" onClick={() => router.push(`/workspaces/${org._id}`)}>
                                                                {org.companyName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(org)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{org.orgAdmin || "No Admin"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700">{org.email}</div>
                                                    <div className="text-sm text-gray-500">{org.whatsappNo}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                                        <span className={`text-sm ${new Date(org.trialExpires) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                                                            {new Date(org.trialExpires).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <Button
                                                            onClick={() => openExtendDialog(org._id, org.companyName)}
                                                            size="sm"
                                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200"
                                                        >
                                                            <Clock className="h-3.5 w-3.5 mr-1" />
                                                            Extend
                                                        </Button>
                                                        <Button
                                                            onClick={() => openRevokeDialog(org._id, org.companyName)}
                                                            size="sm"
                                                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5 mr-1" />
                                                            Revoke
                                                        </Button>
                                                        <Button
                                                            onClick={() => router.push(`/workspaces/${org._id}`)}
                                                            size="sm"
                                                            className="bg-purple-50 text-[#5b46d9] hover:bg-purple-100 hover:text-[#4a3bb8] border-purple-200"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            View
                                                        </Button>
                                                    </div>
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

            {/* Extend Trial Dialog */}
            <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
                <DialogContent className="bg-white text-gray-800 p-6 max-w-md rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-center text-gray-800">
                            Extend Trial Period
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center my-4">
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                            <Clock className="h-10 w-10 text-blue-500" />
                        </div>
                        <p className="text-gray-600 text-center mb-6">
                            You're about to extend the trial period for <span className="font-semibold">{selectedOrgName}</span>.
                        </p>

                        <div className="w-full">
                            <label htmlFor="extensionDays" className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Days
                            </label>
                            <Input
                                id="extensionDays"
                                type="number"
                                value={extensionDays}
                                onChange={(e) => setExtensionDays(Number(e.target.value))}
                                className="w-full border-gray-300 focus:border-[#5b46d9] focus:ring-[#5b46d9]"
                                placeholder="Enter the number of days"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex space-x-3 mt-4">
                        <Button
                            onClick={() => setExtendOpen(false)}
                            variant="outline"
                            className="flex-1 text-white -700  border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleExtendTrial}
                            className="flex-1 bg-[#5b46d9] hover:bg-[#4a3bb8] text-white"
                        >
                            Confirm Extension
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Revoke Trial Dialog */}
            <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
                <DialogContent className="bg-white text-gray-800 p-6 max-w-md rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-center text-gray-800">
                            Revoke Trial Period
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center my-4">
                        <div className="bg-red-50 p-4 rounded-full mb-4">
                            <XCircle className="h-10 w-10 text-red-500" />
                        </div>
                        <p className="text-gray-600 text-center">
                            Are you sure you want to revoke the trial period for <span className="font-semibold">{selectedOrgName}</span>?
                        </p>
                        <p className="text-red-600 text-sm mt-4 text-center">
                            This action cannot be undone. The organization will lose access to trial features immediately.
                        </p>
                    </div>

                    <DialogFooter className="flex space-x-3 mt-4">
                        <Button
                            onClick={() => setRevokeOpen(false)}
                            variant="outline"
                            className="flex-1 text-white -700 border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={revokeTrialPeriod}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Yes, Revoke
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
