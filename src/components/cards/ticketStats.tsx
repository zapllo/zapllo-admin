import React from "react";
import { Card, CardContent } from "../ui/card";
import { CheckCircle, Clock, AlertCircle, Ticket } from "lucide-react";

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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex items-center h-full">
                        <div className="w-2 bg-blue-500 h-full"></div>
                        <div className="flex-1 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Tickets</p>
                                    <p className="text-2xl font-bold text-gray-800">{(statsData.totalTickets || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-100">
                                    <Ticket className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                                All tickets in the system
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex items-center h-full">
                        <div className="w-2 bg-green-500 h-full"></div>
                        <div className="flex-1 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Resolved</p>
                                    <p className="text-2xl font-bold text-gray-800">{(statsData.resolvedTickets || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-full bg-green-100">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                                {statsData.resolvedTickets > 0 && statsData.totalTickets > 0 ?
                                    `${Math.round((statsData.resolvedTickets / statsData.totalTickets) * 100)}% completion rate` :
                                    'No tickets resolved yet'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex items-center h-full">
                        <div className="w-2 bg-amber-500 h-full"></div>
                        <div className="flex-1 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending</p>
                                    <p className="text-2xl font-bold text-gray-800">{(statsData.pendingTickets || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-full bg-amber-100">
                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                                {statsData.pendingTickets > 0 ?
                                    `Requires attention` :
                                    'No pending tickets'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex items-center h-full">
                        <div className="w-2 bg-purple-500 h-full"></div>
                        <div className="flex-1 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">In Resolution</p>
                                    <p className="text-2xl font-bold text-gray-800">{(statsData.inResolutionTickets || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100">
                                    <Clock className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                                {statsData.inResolutionTickets > 0 ?
                                    `Work in progress` :
                                    'No tickets in resolution'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
