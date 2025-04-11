"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { Building, Users, BarChart3, Globe, IndianRupee, PlusCircleIcon } from "lucide-react";

interface Onboarding {
  _id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  industry: string;
  email: string;
  whatsappNo: string;
  countryCode: string;
  orderId: string;
  paymentId: string;
  amount: number;
  planName: string;
  creditedAmount: number;
  subscribedUserCount: number;
  createdAt: Date;
}

export default function OnboardingTable() {
  const [onboardingLogs, setOnboardingLogs] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Onboarding | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOnboardingLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/onboardings");

        if (!res.ok) {
          throw new Error(`Failed to fetch onboarding data: ${res.status}`);
        }

        const data = await res.json();
        setOnboardingLogs(data.data);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        toast.error(`Error loading onboarding data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchOnboardingLogs();
  }, []);

  const handleRegister = async (onboarding: Onboarding) => {
    // Helper function to map subscribedUserCount to teamSize
    const determineTeamSize = (count: number): string => {
      if (count <= 10) return "1-10";
      if (count <= 20) return "11-20";
      if (count <= 30) return "21-30";
      if (count <= 50) return "31-50";
      return "51+";
    };

    try {
      toast.loading("Registering user...");

      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          onboardingId: onboarding._id,
          whatsappNo: onboarding.whatsappNo,
          firstName: onboarding.firstName,
          lastName: onboarding.lastName,
          email: onboarding.email,
          companyName: onboarding.companyName,
          teamSize: determineTeamSize(onboarding.subscribedUserCount),
          description: onboarding.companyName,
          industry: onboarding.industry,
          country: onboarding.countryCode,
        }),
      });

      const data = await res.json();

      toast.dismiss();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("User registered successfully!");
        setOnboardingLogs((prevLogs) =>
          prevLogs.filter((log) => log._id !== onboarding._id)
        );
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Registration failed: ${error.message}`);
    }
  };

  // Sort and filter functionality
  const sortData = (field: keyof Onboarding) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Apply sorting and filtering
  const filteredAndSortedData = onboardingLogs
    .filter(log =>
      log.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.industry.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0;

      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

  // Helper function to get the user's initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Loading skeletons
  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Onboarding Logs</CardTitle>
          <CardDescription>Manage new user registrations</CardDescription>
          <Skeleton className="h-10 w-full mt-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-md border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Error Loading Data</CardTitle>
          <CardDescription>There was a problem retrieving the onboarding logs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md mt-12">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Onboarding Logs</CardTitle>
            <CardDescription>
              {onboardingLogs.length} users pending registration
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-3 pr-10 py-2 w-full sm:w-64 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-3 top-2.5 text-gray-400">
                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]" onClick={() => sortData('firstName')}>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
                    User
                    {sortField === 'firstName' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => sortData('companyName')}>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
                    Company
                    {sortField === 'companyName' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => sortData('industry')}>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
                    Industry
                    {sortField === 'industry' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => sortData('planName')}>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
                    Plan
                    {sortField === 'planName' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => sortData('amount')} className="text-right">
                  <div className="flex items-center justify-end gap-2 cursor-pointer hover:text-primary">
                    Amount
                    {sortField === 'amount' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(log.firstName, log.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {log.firstName} {log.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.email}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {log.countryCode} · {log.whatsappNo}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{log.companyName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {log.subscribedUserCount} users
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span>{log.industry || "Not specified"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {log.planName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium flex items-center justify-end">
                        <IndianRupee className="h-3 w-3 inline mr-1" />
                        {log.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRegister(log)} className="cursor-pointer">
                            <PlusCircleIcon className="mr-2 h-4 w-4" />
                            <span>Register User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="h-10 w-10 mb-2" />
                      <p>No matching onboarding records found</p>
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          onClick={() => setSearchTerm("")}
                          className="mt-2 text-xs"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Statistics Row */}
        {onboardingLogs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                    <h3 className="text-2xl font-bold mt-1">{onboardingLogs.length}</h3>
                  </div>
                  <Users className="h-8 w-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <h3 className="text-2xl font-bold mt-1">
                      <IndianRupee className="h-4 w-4 inline" />
                      {onboardingLogs.reduce((sum, log) => sum + log.amount, 0).toLocaleString()}
                    </h3>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Companies</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {new Set(onboardingLogs.map(log => log.companyName)).size}
                    </h3>
                  </div>
                  <Building className="h-8 w-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {onboardingLogs.reduce((sum, log) => sum + log.subscribedUserCount, 0)}
                    </h3>
                  </div>
                  <Globe className="h-8 w-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Batch Actions */}
        {filteredAndSortedData.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedData.length} records displayed
              {searchTerm && ` (filtered from ${onboardingLogs.length})`}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortField(null);
                  setSearchTerm("");
                }}
              >
                Reset filters
              </Button>

              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => {
                  // Register first 5 users in batch or show modal
                  toast.info("Batch registration would go here");
                }}
              >
                <PlusCircleIcon className="h-4 w-4" />
                Register batch
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
