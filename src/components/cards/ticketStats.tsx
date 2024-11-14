import React from "react";
import { Card, CardContent } from "../ui/card";

type StatsProps = {
    statsData: {
        totalTickets: number;
        resolvedTickets: number;
        pendingTickets: number;
        inResolutionTickets: number;
    };
};

export default function TicketStats({ statsData }: StatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 h-22">
            <Card className="bg-[#0A0D28] border-none text-white">
                <CardContent className="flex items-center gap-4 p-6 h-[142px]">
                    <div className="rounded-full w-[82px] h-[82px] bg-purple-500/10 flex items-center justify-center">
                        <img src="/tickboard.png" alt="Total Tasks Icon" />
                    </div>
                    <div>
                        <p className="text-sm text-[14px] font-medium text-gray-400">TOTAL TICKETS</p>
                        <p className="text-2xl font-bold">{(statsData.totalTickets || 0).toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#0A0D28] border-none text-white">
                <CardContent className="flex items-center gap-4 p-6 h-[142px]">
                    <div className="rounded-full w-[82px] h-[82px] bg-purple-500/10 flex items-center justify-center">
                        <img src="/tickcircle.png" alt="Tasks Completed Icon" />
                    </div>
                    <div>
                        <p className="text-sm text-[14px] font-medium text-gray-400">TICKETS RESOLVED</p>
                        <p className="text-2xl font-bold">{(statsData.resolvedTickets || 0).toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#0A0D28] border-none text-white">
                <CardContent className="flex items-center gap-4 p-6 h-[142px]">
                    <div className="rounded-full w-[82px] h-[82px] bg-purple-500/10 flex items-center justify-center">
                        <img src="/building.png" alt="Total Organizations Icon" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">PENDING TICKETS</p>
                        <p className="text-2xl font-bold">{(statsData.pendingTickets || 0).toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#0A0D28] border-none text-white">
                <CardContent className="flex items-center gap-4 p-6 h-[142px]">
                    <div className="rounded-full w-[82px] h-[82px] bg-purple-500/10 flex items-center justify-center">
                        <img src="/group.png" alt="Total Users Icon" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">In RESOLUTION </p>
                        <p className="text-2xl font-bold">{(statsData.inResolutionTickets || 0).toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
