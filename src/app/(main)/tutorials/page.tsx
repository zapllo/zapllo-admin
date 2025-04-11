"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, Lightbulb, XIcon, Play, Book, GraduationCap, Clock, Gift } from "lucide-react";
import Link from "next/link";

import InfoBar from "@/components/infobar/infobar";
import AdminSidebar from "@/components/sidebar/adminSidebar";
import Tutorials from "@/components/tutorials";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Organization {
    trialExpires: Date;
    name: string;
}

interface UserData {
    isPro: boolean;
    name: string;
    email: string;
    tutorialProgress?: {
        completed: string[];
        inProgress: string[];
        percentComplete: number;
    };
}

export default function TutorialsPage() {
    // State variables
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isTrialBannerVisible, setIsTrialBannerVisible] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const [trialExpires, setTrialExpires] = useState<Date | null>(null);
    const [timeMessage, setTimeMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [activeTab, setActiveTab] = useState("all");

    const pathname = usePathname();

    // Calculate trial expiration notice
    useEffect(() => {
        if (trialExpires) {
            const now = new Date();
            const expired = trialExpires <= now;

            if (expired) {
                setTimeMessage("Your trial has expired");
            } else {
                const timeLeft = formatDistanceToNow(trialExpires, { addSuffix: true });
                setTimeMessage(`Trial expires ${timeLeft}`);
            }
        }
    }, [trialExpires]);

    // Fetch user and organization data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch user details
                const userRes = await axios.get("/api/users/me");
                const userData = userRes.data.data;
                setUserData(userData);
                setIsPro(userData.isPro);

                // Fetch organization details
                const orgRes = await axios.get("/api/organization/getById");
                const orgData = orgRes.data.data;
                setOrganization(orgData);

                const trialEnd = new Date(orgData.trialExpires);
                const expired = trialEnd <= new Date();

                setTrialExpires(trialEnd);
                setIsTrialExpired(expired);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load user data");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Retry loading if there was an error
    const handleRetry = () => {
        setLoading(true);
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#04061E]">
            <div className="flex h-full w-full">
                <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                <div className="flex-1 w-full overflow-y-auto">
                    <InfoBar />

                    <main className={cn(
                        "p-6 transition-all duration-300",
                        isCollapsed ? "ml-20" : "ml-64"
                    )}>
                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                          


                        </div>



                        {loading ? (
                            <div className="space-y-6">
                                {/* Loading Skeletons */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[...Array(3)].map((_, i) => (
                                        <Card key={i} className="border shadow-sm">
                                            <CardHeader className="pb-2">
                                                <Skeleton className="h-5 w-2/3 mb-1" />
                                                <Skeleton className="h-4 w-full" />
                                            </CardHeader>
                                            <CardContent>
                                                <Skeleton className="h-32 w-full rounded-md mb-4" />
                                                <Skeleton className="h-4 w-full mb-2" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </CardContent>
                                            <CardFooter>
                                                <Skeleton className="h-9 w-full rounded-md" />
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Tutorials
                                    isCollapsed={isCollapsed}
                                    setIsCollapsed={setIsCollapsed}
                                />



                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
