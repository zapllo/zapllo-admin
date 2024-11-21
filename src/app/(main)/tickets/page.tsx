"use client";

import Dashboard from "@/components/dashboard";
import InfoBar from "@/components/infobar/infobar";
import AdminSidebar from "@/components/sidebar/adminSidebar";
import TicketsTable from "@/components/tickets";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { formatDistanceToNow, intervalToDuration } from "date-fns";
import { XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {}

export default function TicketDashboard({ }: Props) {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const [trialExpires, setTrialExpires] = useState<Date | null>(null);
    const [timeMessage, setTimeMessage] = useState("");
    const [userLoading, setUserLoading] = useState<boolean | null>(false);
    const [isCollapsed, setIsCollapsed] = React.useState(false);


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
    return (
        <div>
            <div
                className={`flex  dark:bg-[#04061E] scrollbar-hide h-full w-full`}
            >
                <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                <div className="w-full overflow-y-scroll scrollbar-hide  h-screen">
                    <div className="">
                    <InfoBar />

                    </div>
                    <div className={`${isCollapsed ? "ml-20" : "ml-0"
                        }`}>
                        <TicketsTable setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />
                    </div>
                </div>
            </div>
        </div>
    )
}