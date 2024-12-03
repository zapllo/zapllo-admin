"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

export default function EditAnnouncementDialog({
  announcement,
  onAnnouncementUpdated,
  isOpen,
  onClose,
}: {
  announcement: any;
  onAnnouncementUpdated: (announcement: any) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [announcementName, setAnnouncementName] = useState(announcement.announcementName);
  const [startDate, setStartDate] = useState(announcement.startDate);
  const [endDate, setEndDate] = useState(announcement.endDate);
  const [buttonName, setButtonName] = useState(announcement.buttonName);
  const [buttonLink, setButtonLink] = useState(announcement.buttonLink);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form values when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAnnouncementName(announcement.announcementName);
      setStartDate(announcement.startDate);
      setEndDate(announcement.endDate);
      setButtonName(announcement.buttonName);
      setButtonLink(announcement.buttonLink);
    }
  }, [isOpen, announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.patch(`/api/announcements/${announcement._id}`, {
        announcementName,
        startDate,
        endDate,
        buttonName,
        buttonLink,
      });

      onAnnouncementUpdated(response.data.announcement);
      onClose(); // Close dialog after successful update
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6">
        <div className="flex justify-between">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Announcement</DialogTitle>
          </DialogHeader>
          <DialogClose>
            <X className="text-white cursor-pointer" onClick={onClose} />
          </DialogClose>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <input
              type="text"
              placeholder="Announcement Name"
              value={announcementName}
              onChange={(e) => setAnnouncementName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded bg-transparent outline-none text-white"
              required
            />
            <div className="flex space-x-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-4 py-2 border border-gray-700 rounded bg-transparent outline-none text-white"
                required
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-4 py-2 border border-gray-700 rounded bg-transparent outline-none text-white"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Button Name"
              value={buttonName}
              onChange={(e) => setButtonName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded bg-transparent outline-none text-white"
              required
            />
            <input
              type="url"
              placeholder="Button Link"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded bg-transparent outline-none text-white"
              required
            />
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <button
              type="submit"
              className="bg-[#017a5b] w-full text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
