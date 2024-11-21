'use client'


import InfoBar from '@/components/infobar/infobar';
import AdminSidebar from '@/components/sidebar/adminSidebar';
import WorkspacesTable from '@/components/tables/workspacesTable';
import React, { useEffect, useState } from 'react';


export default function Organizations() {

    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div>
            <div
                className={`flex  dark:bg-[#04061E] scrollbar-hide h-full w-full`}
            >
                <div className=''>
                    <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                </div>
                <div className="w-full overflow-y-scroll scrollbar-hide  h-screen">
                    <InfoBar />
                    <div className={`${isCollapsed ? "ml-20" : "ml-0"
                        }`}>
                        <WorkspacesTable setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />
                    </div>
                </div>
            </div>
        </div>

    );
}
