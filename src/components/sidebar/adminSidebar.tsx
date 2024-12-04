import { cn } from '@/lib/utils'
import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import {
    Bell,
    Eye,
    Search,
    Users,
    Home,
    Settings,
    CreditCard,
    HelpCircle,
    ChevronLeft,
    Ticket,
    Users2,
    Currency,
    CurrencyIcon,
    Wallet,
    Megaphone,
    VideoIcon,
    TicketCheckIcon,
    Wallet2Icon,
    CheckCheckIcon,
    CoinsIcon,
    GitGraphIcon,
    GitGraph,
    ChartLineIcon,
    UserSquare2,
    UserRoundSearch,
    UserRoundPlusIcon,
    CircleHelpIcon,
    UserPlus2Icon,
    UserPlus2,
    Grid2X2PlusIcon,
    MegaphoneIcon,
} from "lucide-react";

type AdminSidebarProps = {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", icon: Home, link: "/dashboard" },
        { name: "Tickets", icon: Ticket, link: "/tickets" },
        { name: "Workspaces", icon: Users2, link: "/workspaces", hasGradient: true },
        { name: "Subscriptions", icon: Wallet, link: "/admin/subscriptions" },
        { name: "Announcements", icon: Megaphone, link: "/announcements" },
        { name: "Tutorials", icon: VideoIcon, link: "/tutorials" },
        { name: "Coupons", icon: TicketCheckIcon, link: "/admin/coupons" },
        { name: "Payments", icon: Wallet2Icon, link: "/admin/payments" },
        { name: "Checklist", icon: CheckCheckIcon, link: "/checklist" },
        { name: "Resources", icon: CoinsIcon, link: "/admin/resources" },
        { name: "Reports", icon: ChartLineIcon, link: "/admin/reports" },
        { name: "Referrals", icon: UserSquare2, link: "/admin/referrals" },
        { name: "Leads", icon: UserRoundSearch, link: "/admin/leads" },
        { name: "Onboarding Logs", icon: UserRoundPlusIcon, link: "/onboardingLogs" },
        { name: "Roles & Permissions", icon: UserPlus2, link: "/admin/roles-permissions" },
        { name: "Task Templates", icon: Grid2X2PlusIcon, link: "/admin/task-templates" },
        { name: "Events", icon: MegaphoneIcon, link: "/admin/events" },
        { name: "Support Dashboard", icon: CircleHelpIcon, link: "/admin/support" },
    ];

    return (
        <div
            className={cn(
                "bg-[#0f1025] flex flex-col fixed h-full z-[100] transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <img
                        src="/zapllo.png"
                        alt="Zapllo Logo"
                        className={cn("transition-all duration-200", isCollapsed ? "h-7 w-auto" : "h-8 w-auto")}
                    />
                    {!isCollapsed && (
                        <span className="text-xl font-bold text-white">Admin</span>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 hover:text-white text-white w-6 p-0 bg-[#37384B] hover:bg-[#37384B] rounded-full ${
                        isCollapsed ? "ml-12 absolute" : ""
                    }`}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <ChevronLeft
                        className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isCollapsed && "rotate-180"
                        )}
                    />
                </Button>
            </div>

            <nav className="flex-1 overflow-y-scroll overflow-x-hidden scrollbar-hide p-4 space-y-2">
                <TooltipProvider delayDuration={0}>
                    {menuItems.map((item) => (
                        <Tooltip key={item.name}>
                            <TooltipTrigger asChild>
                                <a
                                    href={item.link}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white transition-colors group relative overflow-hidden",
                                        pathname === item.link ? "bg-[#FC8929]  text-white" : "",
                                        isCollapsed && "justify-center"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-5 w-5 shrink-0",
                                            isCollapsed && "h-5 w-5"
                                        )}
                                    />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </a>
                            </TooltipTrigger>

                            {isCollapsed && (
                                <TooltipContent
                                    side="right"
                                    className="border-gray-800 bg-gray-900 text-white"
                                >
                                    {item.name}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>
        </div>
    );
}
