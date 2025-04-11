"use client";

import InfoBar from "@/components/infobar/infobar";
import AdminSidebar from "@/components/sidebar/adminSidebar";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { formatDistanceToNow, intervalToDuration } from "date-fns";
import { XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const [trialExpires, setTrialExpires] = useState<Date | null>(null);
    const [timeMessage, setTimeMessage] = useState("");
    const [userLoading, setUserLoading] = useState<boolean | null>(false);
    const [isCollapsed, setIsCollapsed] = React.useState(true);
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        const fetchActiveAnnouncements = async () => {
            try {
                const response = await axios.get("/api/announcements");
                setAnnouncements(response.data.attachments);
            } catch (error) {
                console.error("Error fetching active announcements:", error);
            }
        };

        fetchActiveAnnouncements();
    }, []);


    const handleClose = () => setIsVisible(false);

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                setUserLoading(true);
                const userRes = await axios.get("/api/users/me");
                setIsPro(userRes.data.data.isPro);
                const response = await axios.get("/api/organization/getById");

                const organization = response.data.data;
                const trialEnd = new Date(organization.trialExpires);
                const expired = trialEnd <= new Date();

                setTrialExpires(trialEnd);
                setIsTrialExpired(expired);
                setUserLoading(false);
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        getUserDetails();
    }, []);


   // ... existing code ...

return (
    <div className="h-screen flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden dark:bg-[#04061E]">
            <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div className="flex-1 overflow-hidden flex flex-col">
                <InfoBar />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    </div>
);
}

// ... existing code ...

export default Layout;
