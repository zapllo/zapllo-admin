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


export default function CreateAnnouncement({ onAnnouncemnetCreated }: { onAnnouncemnetCreated: (announcement: any) => void }) {
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

      onAnnouncemnetCreated(response.data.announcement);
      setAnnouncementName("");
      setStartDate("");
      setEndDate("");
      setButtonName("");
      setButtonLink("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Announcement
        </button>
      </DialogTrigger>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle className="text-white">Create Announcement</DialogTitle>
        </DialogHeader>
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
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
            <DialogClose>
              <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
