"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";
import CreateAnnouncement from "./modals/createAnnouncement";
import EditAnnouncementDialog from "./modals/editAnnouncement";
import DeleteConfirmationDialog from "./modals/deleteConfirmationDialog";
import {
  AlertTriangle,
  Calendar,
  Edit2,
  ExternalLink,
  Info,
  Megaphone,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

interface Announcement {
  _id: string;
  announcementName: string;
  startDate: string;
  endDate: string;
  buttonName: string;
  buttonLink: string;
  isActive: boolean;
}

const Announcements = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState<string>("all");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/announcements");
      setAnnouncements(response.data.announcements);
      setFilteredAnnouncements(response.data.announcements);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      toast.error("Failed to load announcements");
      setLoading(false);
    }
  };

  // Fetch announcements
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Filter announcements based on search term and tab
  useEffect(() => {
    let filtered = announcements;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.announcementName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.buttonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.buttonLink.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTabKey === "active") {
      filtered = filtered.filter((announcement) => announcement.isActive);
    } else if (activeTabKey === "inactive") {
      filtered = filtered.filter((announcement) => !announcement.isActive);
    } else if (activeTabKey === "upcoming") {
      filtered = filtered.filter(
        (announcement) => new Date(announcement.startDate) > new Date()
      );
    } else if (activeTabKey === "expired") {
      filtered = filtered.filter(
        (announcement) => new Date(announcement.endDate) < new Date()
      );
    }

    setFilteredAnnouncements(filtered);
  }, [searchTerm, announcements, activeTabKey]);

  const activeAnnouncement = announcements.find((announcement) => announcement?.isActive);

  // Handler functions
  const handleAnnouncementCreated = (newAnnouncement: Announcement) => {
    setAnnouncements((prev) => [...prev, newAnnouncement]);
    toast.success("Announcement created successfully");
    setShowCreateModal(false);
  };

  const handleAnnouncementUpdated = (updatedAnnouncement: Announcement) => {
    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement._id === updatedAnnouncement._id ? updatedAnnouncement : announcement
      )
    );
    setAnnouncementToEdit(null);
    toast.success("Announcement updated successfully");
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;

    try {
      setLoading(true);
      await axios.delete(`/api/announcements/${announcementToDelete}`);
      setAnnouncements((prev) =>
        prev.filter((announcement) => announcement._id !== announcementToDelete)
      );
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
      toast.success("Announcement deleted successfully");
      setLoading(false);
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast.error("Failed to delete announcement");
      setLoading(false);
    }
  };

  const handleSwitchIsActive = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistically update the state
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement._id === id
            ? { ...announcement, isActive: !currentStatus }
            : currentStatus && announcement.isActive
              ? { ...announcement, isActive: false }
              : announcement
        )
      );

      // API call
      await axios.patch(`/api/announcements/${id}/isActive`, { isActive: !currentStatus });

      toast.success(`Announcement ${!currentStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      console.error("Error updating isActive:", err);
      toast.error("Failed to update announcement status");

      // Revert state if the request fails
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement._id === id ? { ...announcement, isActive: currentStatus } : announcement
        )
      );
    }
  };

  const isExpired = (endDate: string) => {
    return dayjs(endDate).isBefore(dayjs());
  };

  const isUpcoming = (startDate: string) => {
    return dayjs(startDate).isAfter(dayjs());
  };

  const getStatusBadge = (announcement: Announcement) => {
    if (announcement.isActive) {
      return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
    } else if (isExpired(announcement.endDate)) {
      return <Badge variant="outline" className="text-red-500 border-red-500">Expired</Badge>;
    } else if (isUpcoming(announcement.startDate)) {
      return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Upcoming</Badge>;
    } else {
      return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
    }
  };

  // Function to calculate time remaining or time passed
  const getTimeStatus = (announcement: Announcement) => {
    const now = dayjs();
    const start = dayjs(announcement.startDate);
    const end = dayjs(announcement.endDate);

    if (announcement.isActive) {
      return `Ends ${end.fromNow()}`;
    } else if (isUpcoming(announcement.startDate)) {
      return `Starts ${start.fromNow()}`;
    } else if (isExpired(announcement.endDate)) {
      return `Ended ${end.fromNow()}`;
    } else {
      return `Inactive`;
    }
  };

  return (
    <div className="container mx-auto mt-12 px-4 py-6">
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "ml-" : "ml-12"
      )}>
        <Card className="shadow-md border-slate-200 dark:border-slate-800">
          <CardHeader className="space-y-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Megaphone className="h-6 w-6 text-primary" />
                  Announcements
                </CardTitle>
                <CardDescription>
                  Manage announcements displayed to users across the platform
                </CardDescription>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    className="pl-9 pr-4 py-2 w-full md:w-[250px] rounded-md border border-input bg-background text-sm ring-offset-background
                    file:border-0 file:bg-transparent file:text-sm file:font-medium
                    placeholder:text-muted-foreground focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={fetchAnnouncements}
                        className="h-9 w-9"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh announcements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Active Announcement Preview */}
            {activeAnnouncement && (
              <div className="p-4 mx-4 my-4 border rounded-lg dark:bg-slate-900/50 bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Currently Active Announcement</h3>
                </div>

                <div className="bg-slate-200/50 dark:bg-slate-800/50 p-3 rounded-md border border-slate-300 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <span className="text-lg font-medium">{activeAnnouncement.announcementName}</span>
                    {getStatusBadge(activeAnnouncement)}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {dayjs(activeAnnouncement.startDate).format("MMM DD, YYYY")} - {dayjs(activeAnnouncement.endDate).format("MMM DD, YYYY")}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-primary dark:text-primary">
                      {getTimeStatus(activeAnnouncement)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={activeAnnouncement.isActive}
                        onCheckedChange={() =>
                          handleSwitchIsActive(activeAnnouncement._id, activeAnnouncement.isActive)
                        }
                        className="data-[state=checked]:bg-green-600"
                      />
                      <span className="text-sm">Active</span>
                    </div>

                    <a
                      href={activeAnnouncement.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm"
                    >
                      {activeAnnouncement.buttonName}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs and Table */}
            <div className="px-4">
              <Tabs defaultValue="all" onValueChange={setActiveTabKey}>
                <div className="flex justify-between items-center border-b pb-2">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                  </TabsList>

                  <span className="text-sm text-muted-foreground">
                    {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'announcement' : 'announcements'}
                  </span>
                </div>

                <TabsContent value="all" className="pt-4">
                  {renderAnnouncementsList()}
                </TabsContent>

                <TabsContent value="active" className="pt-4">
                  {filteredAnnouncements.length > 0 ?
                    renderAnnouncementsList() :
                    renderEmptyState("No active announcements", "There are no currently active announcements.")}
                </TabsContent>

                <TabsContent value="inactive" className="pt-4">
                  {filteredAnnouncements.length > 0 ?
                    renderAnnouncementsList() :
                    renderEmptyState("No inactive announcements", "All announcements are currently active.")}
                </TabsContent>

                <TabsContent value="upcoming" className="pt-4">
                  {filteredAnnouncements.length > 0 ?
                    renderAnnouncementsList() :
                    renderEmptyState("No upcoming announcements", "There are no announcements scheduled for the future.")}
                </TabsContent>

                <TabsContent value="expired" className="pt-4">
                  {filteredAnnouncements.length > 0 ?
                    renderAnnouncementsList() :
                    renderEmptyState("No expired announcements", "There are no announcements that have ended.")}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>

          <CardFooter className="border-t px-6 py-4 flex justify-between">
            <span className="text-sm text-muted-foreground">
              Total: {announcements.length} announcements
              {activeAnnouncement ? ` (${announcements.filter(a => a.isActive).length} active)` : ""}
            </span>
           {/* Modals */}
        {showCreateModal && (
          <CreateAnnouncement
            onAnnouncementCreated={handleAnnouncementCreated}
          />
        )}
          </CardFooter>
        </Card>



        {announcementToEdit && (
          <EditAnnouncementDialog
            announcement={announcementToEdit}
            onAnnouncementUpdated={handleAnnouncementUpdated}
            isOpen={!!announcementToEdit}
            onClose={() => setAnnouncementToEdit(null)}
          />
        )}

        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Announcement"
          description="Are you sure you want to delete this announcement? This action cannot be undone."
        />
      </div>
    </div>
  );

  // Helper function to render the announcements list
  function renderAnnouncementsList() {
    if (loading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[250px]" />
                  <Skeleton className="h-4 w-[180px]" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredAnnouncements.length === 0) {
      return renderEmptyState(
        searchTerm ? "No matching announcements" : "No announcements yet",
        searchTerm ? `No announcements match the search term "${searchTerm}".` : "Create your first announcement to get started."
      );
    }

    return (
      <div className="space-y-3">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement._id}
            className={cn(
              "border rounded-lg p-4 transition-colors",
              announcement.isActive ?
                "border-primary/40 dark:border-primary/20 bg-primary/5" :
                "hover:bg-accent/50"
            )}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{announcement.announcementName}</h3>
                  {getStatusBadge(announcement)}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {dayjs(announcement.startDate).format("MMM DD, YYYY")} - {dayjs(announcement.endDate).format("MMM DD, YYYY")}
                  </span>
                  <span className="text-xs">
                    ({getTimeStatus(announcement)})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={announcement.isActive}
                    onCheckedChange={() => handleSwitchIsActive(announcement._id, announcement.isActive)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className="text-sm">{announcement.isActive ? "Active" : "Inactive"}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setAnnouncementToEdit(announcement)}
                      className="cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setAnnouncementToDelete(announcement._id);
                        setDeleteDialogOpen(true);
                      }}
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a
                        href={announcement.buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Link
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Button:</span>
                <Badge variant="outline" className="font-normal">
                  {announcement.buttonName}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Link:</span>
                <a
                  href={announcement.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 max-w-[300px] truncate"
                >
                  {announcement.buttonLink}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Helper function to render empty states
  function renderEmptyState(title: string, description: string) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        {searchTerm ? (
          <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        ) : (
          <Megaphone className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        )}
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

        {searchTerm ? (
          <Button variant="outline" onClick={() => setSearchTerm("")}>
            Clear Search
          </Button>
        ) : activeTabKey !== "all" ? (
          <Button variant="outline" onClick={() => setActiveTabKey("all")}>
            View All Announcements
          </Button>
        ) : (
        <div></div>
        )}
      </div>
    );
  }
};

// X icon component
function X({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default Announcements;
