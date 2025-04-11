"use client";

import React, { useState } from "react";
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

export default function CreateAnnouncement({
  onAnnouncementCreated,
}: {
  onAnnouncementCreated: (announcement: any) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [announcementName, setAnnouncementName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("/api/announcements", {
        announcementName,
        startDate,
        endDate,
        buttonName,
        buttonLink,
      });

      onAnnouncementCreated(response.data.announcements);
      setAnnouncementName("");
      setStartDate("");
      setEndDate("");
      setButtonName("");
      setButtonLink("");
      setDialogOpen(false); // Close dialog after successful creation
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger className="bg-[#017a5b] text-sm text-white px-4 py-2 rounded">
        Create Announcement
      </DialogTrigger>
      <DialogContent className="p-6 z-[100]">
        <div className="flex justify-between">
          <DialogHeader>
            <DialogTitle className="">Create Announcement</DialogTitle>
          </DialogHeader>
         
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <input
              type="text"
              placeholder="Announcement Name"
              value={announcementName}
              onChange={(e) => setAnnouncementName(e.target.value)}
              className="w-full px-4 py-2 border 0 rounded bg-transparent outline-none text-"
              required
            />
            <div className="flex space-x-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-4 py-2 border  rounded bg-transparent outline-none text-"
                required
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-4 py-2 border b0 rounded bg-transparent outline-none tex"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Button Name"
              value={buttonName}
              onChange={(e) => setButtonName(e.target.value)}
              className="w-full px-4 py-2 border borde rounded bg-transparent outline-none text-"
              required
            />
            <input
              type="url"
              placeholder="Button Link"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
              className="w-full px-4 py-2 border -700 rounded bg-transparent outline-none text-"
              required
            />
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <button
              type="submit"
              className="bg-[#017a5b] text-sm w-full text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}
