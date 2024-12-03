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

export default function EditTutorialDialog({
  tutorial,
  onTutorialUpdated,
}: {
  tutorial: any;
  onTutorialUpdated: (tutorial: any) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState(tutorial.title);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [link, setLink] = useState(tutorial.link);
  const [category, setCategory] = useState(tutorial.category);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnail(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("files", file);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.fileUrls[0];
    } catch (err) {
      throw new Error("File upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let thumbnailUrl = tutorial.thumbnail;
      if (thumbnail) {
        thumbnailUrl = await uploadFile(thumbnail);
      }

      const updatedTutorial = {
        ...tutorial,
        title,
        thumbnail: thumbnailUrl,
        link,
        category,
      };

      const response = await axios.patch(`/api/tutorials/${tutorial._id}`, updatedTutorial);
      onTutorialUpdated(response.data.tutorial);

      setDialogOpen(false); // Close dialog
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <button className="text-blue-500 underline">Edit</button>
      </DialogTrigger>
      <DialogContent className="p-6">
        <div className="flex justify-between w-full">
          <DialogHeader>
            <DialogTitle className="text-white ml-4">Edit Tutorial</DialogTitle>
          </DialogHeader>
          <DialogClose>
            <X className="text-white cursor-pointer" />
          </DialogClose>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded bg-transparent outline-none text-white"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-700 rounded bg-transparent outline-none text-white"
            />
            <input
              type="url"
              placeholder="Link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded bg-transparent outline-none text-white"
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded bg-[#0B0D29] outline-none text-white"
              required
            >
              <option value="">Select Category</option>
              {["Task Delegation App", "Leave and Attendance App", "Zapllo WABA"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                )
              )}
            </select>
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <button
              type="submit"
              className="bg-[#017a5b] w-full text-sm text-white px-4 py-2 rounded"
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
