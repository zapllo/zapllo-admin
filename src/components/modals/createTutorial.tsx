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

const categoryOptions = [
  "Task Delegation App",
  "Leave and Attendance App",
  "Zapllo WABA",
];

export default function CreateTutorialDialog({
  onTutorialCreated,
}: {
  onTutorialCreated: (tutorial: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");
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
      return response.data.fileUrls[0]; // Return the uploaded file URL
    } catch (err) {
      throw new Error("File upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Upload thumbnail
      let thumbnailUrl = "";
      if (thumbnail) {
        thumbnailUrl = await uploadFile(thumbnail);
      }

      // Create the tutorial
      const response = await axios.post("/api/tutorials", {
        title,
        thumbnail: thumbnailUrl,
        link, // The link remains a URL input
        category,
      });

      onTutorialCreated(response.data.tutorial);

      // Reset form
      setTitle("");
      setThumbnail(null);
      setLink("");
      setCategory("");
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
          Create Tutorial
        </button>
      </DialogTrigger>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle className="text-white ml-4">Create a New Tutorial</DialogTitle>
        </DialogHeader>
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
              required
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
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
