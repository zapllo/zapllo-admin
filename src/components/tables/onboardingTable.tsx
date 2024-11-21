"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOnboardingLogs = async () => {
            try {
                const res = await fetch("/api/onboardings");
                const data = await res.json();
                setOnboardingLogs(data.data);
                setLoading(false);
            } catch (error: any) {
                setError(error.message);
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
                    teamSize: determineTeamSize(onboarding.subscribedUserCount), // Convert to valid enum value
                    description: onboarding.companyName,
                    industry: onboarding.industry,
                    country: onboarding.countryCode,
                }),
            });
            const data = await res.json();

            if (data.error) {
                toast.error(data.error);
            } else {
                toast.success("User registered successfully!");
                setOnboardingLogs((prevLogs) =>
                    prevLogs.filter((log) => log._id !== onboarding._id)
                );
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex min-h-screen mt-12 bg-[#04061e] text-white">
            <main className="p-6 w-full">
                <h1 className="text-center font-bold text-xl">Onboarding Logs</h1>
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full table-auto border-collapse border border-gray-800 text-sm">
                        <thead>
                            <tr className="bg-gray-900 text-left">
                                <th className="border border-gray-800 px-4 py-2">Name</th>
                                <th className="border border-gray-800 px-4 py-2">Company</th>
                                <th className="border border-gray-800 px-4 py-2">Industry</th>
                                <th className="border border-gray-800 px-4 py-2">Email</th>
                                <th className="border border-gray-800 px-4 py-2">WhatsApp</th>
                                <th className="border border-gray-800 px-4 py-2">Plan</th>
                                <th className="border border-gray-800 px-4 py-2">Amount</th>
                                <th className="border border-gray-800 px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {onboardingLogs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-800">
                                    <td className="border border-gray-800 px-4 py-2">
                                        {log.firstName} {log.lastName}
                                    </td>
                                    <td className="border border-gray-800 px-4 py-2">
                                        {log.companyName}
                                    </td>
                                    <td className="border border-gray-800 px-4 py-2">{log.industry}</td>
                                    <td className="border border-gray-800 px-4 py-2">{log.email}</td>
                                    <td className="border border-gray-800 px-4 py-2">{log.whatsappNo}</td>
                                    <td className="border border-gray-800 px-4 py-2">{log.planName}</td>
                                    <td className="border border-gray-800 px-4 py-2">Rs.{log.amount}</td>
                                    <td className="border border-gray-800 px-4 py-2">
                                        <Button
                                            onClick={() => handleRegister(log)}
                                            className="text-sm bg-[#815BF5]"
                                        >
                                            Register
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
