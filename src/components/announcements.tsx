"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import CreateAnnouncement from "./modals/createAnnouncement";
import EditAnnouncementDialog from "./modals/editAnnouncement"; // Import the edit dialog
import DeleteConfirmationDialog from "./modals/deleteConfirmationDialog"; // Import the delete confirmation dialog
import { Switch } from "./ui/switch";

const Announcements = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementToEdit, setAnnouncementToEdit] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);



  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get("/api/announcements");
      setAnnouncements(response.data.announcements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  // Fetch announcements
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const activeAnnouncement = announcements.find((announcement) => announcement.isActive);
  const inactiveAnnouncements = announcements.filter((announcement) => !announcement.isActive);

  // Handle create announcement
  const handleAnnouncementCreated = (newAnnouncement: any) => {
    setAnnouncements((prev) => [...prev, newAnnouncement]);
  };

  // Handle edit announcement
  const handleAnnouncementUpdated = (updatedAnnouncement: any) => {
    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement._id === updatedAnnouncement._id ? updatedAnnouncement : announcement
      )
    );
    setAnnouncementToEdit(null);
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!announcementToDelete) return;

    try {
      await axios.delete(`/api/announcements/${announcementToDelete}`);
      setAnnouncements((prev) =>
        prev.filter((announcement) => announcement._id !== announcementToDelete)
      );
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };


  // Handle switching isActive
  const handleSwitchIsActive = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistically update the state
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement._id === id
            ? { ...announcement, isActive: !currentStatus } // Toggle the status
            : currentStatus // If activating, deactivate others
              ? { ...announcement, isActive: false }
              : announcement
        )
      );

      // Make API call to update the server
      const response = await axios.patch(`/api/announcements/${id}/isActive`, { isActive: !currentStatus });
      const updatedAnnouncement = response.data.announcement;

      // Update the state with the server response
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement._id === updatedAnnouncement._id
            ? updatedAnnouncement
            : announcement
        )
      );
      fetchAnnouncements();
    } catch (err) {
      console.error("Error updating isActive:", err);

      // Revert state if the request fails
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement._id === id ? { ...announcement, isActive: currentStatus } : announcement
        )
      );
    }
  };



  return (
    <div className="p-6 mt-12">
      <CreateAnnouncement onAnnouncementCreated={handleAnnouncementCreated} />


      {activeAnnouncement && (
        <div className="mb-6 mt-4  p-4 border bg-gray-700 border-gray-800 text-white rounded">
          <div className="flex  justify-between">
            <p>
              <strong>Start Date:</strong>{" "}
              {dayjs(activeAnnouncement.startDate).format("MMM DD, YYYY HH:mm A")}
            </p>
            <p>
              <strong>End Date:</strong>{" "}
              {dayjs(activeAnnouncement.endDate).format("MMM DD, YYYY HH:mm A")}
            </p>
          </div>
          <div className="mt-2 flex justify-between text-white">
            <p>
              {activeAnnouncement.announcementName}
            </p>

            <p className="">
              <a
                href={activeAnnouncement.buttonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-700 p-2 text-white rounded "
              >
                {activeAnnouncement.buttonName}
              </a>
            </p>
          </div>
        </div>
      )}

      <table className="w-full mt-6 text-white">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2 px-4">Announcement Name</th>
            <th className="py-2 px-4">Start Date</th>
            <th className="py-2 px-4">End Date</th>
            <th className="py-2 px-4">Button Name</th>
            <th className="py-2 px-4">Button Link</th>
            <th className="py-2 px-4">Active</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((announcement) => (
            <tr key={announcement._id} className="border-b border-gray-700">
              <td className="py-2 px-4">{announcement.announcementName}</td>
              <td className="py-2 px-4">
                {announcement.startDate
                  ? dayjs(announcement.startDate).format("MMM DD, YYYY HH:mm A")
                  : "N/A"}
              </td>
              <td className="py-2 px-4">
                {announcement.endDate
                  ? dayjs(announcement.endDate).format("MMM DD, YYYY HH:mm A")
                  : "N/A"}
              </td>
              <td className="py-2 px-4">{announcement.buttonName}</td>
              <td className="py-2 px-4">
                <a
                  href={announcement.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {announcement.buttonLink}
                </a>
              </td>
              <td className="py-2 px-4">
                <Switch
                  checked={announcement.isActive}
                  onCheckedChange={() => handleSwitchIsActive(announcement._id, announcement.isActive)}
                />
              </td>


              <td className="py-2 px-4 flex space-x-4">
                <button
                  className="text-blue-500 underline"
                  onClick={() => setAnnouncementToEdit(announcement)}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 underline"
                  onClick={() => {
                    setAnnouncementToDelete(announcement._id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Announcement Dialog */}
      {announcementToEdit && (
        <EditAnnouncementDialog
          announcement={announcementToEdit}
          onAnnouncementUpdated={handleAnnouncementUpdated}
          isOpen={!!announcementToEdit}
          onClose={() => setAnnouncementToEdit(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
      />
    </div>
  );
};

export default Announcements;
