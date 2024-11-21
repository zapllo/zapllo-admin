'use client';

import InfoBar from '@/components/infobar/infobar';
import AdminSidebar from '@/components/sidebar/adminSidebar';
import OnboardingTable from '@/components/tables/onboardingTable';
import React from 'react';

export default function OnboardingLogs() {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div className="flex dark:bg-[#04061E] h-full w-full">
            <div>
                <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            </div>
            <div className="w-full overflow-y-scroll h-screen">
                <InfoBar />
                <div className={`${isCollapsed ? 'ml-20' : 'ml-0'}`}>
                    <OnboardingTable />
                </div>
            </div>
        </div>
    );
}
