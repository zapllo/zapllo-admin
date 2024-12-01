'use client';

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import CreateTutorialDialog from "./modals/createTutorial";
import axios from "axios";

const categoryOptions = [
  "All",
  "Task Delegation App",
  "Leave and Attendance App",
  "Zapllo WABA",
];

const Tutorials = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await axios.get("/api/tutorials");
        setTutorials(response.data.tutorials);
      } catch (err) {
        console.error("Failed to fetch tutorials:", err);
        setError("Failed to load tutorials.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  const handleTutorialCreated = (newTutorial: any) => {
    setTutorials((prev) => [...prev, newTutorial]);
  };

  const filteredTutorials =
    selectedCategory === "All"
      ? tutorials
      : tutorials.filter((tutorial) => tutorial.category === selectedCategory);

  return (
    <div className="flex min-h-screen mt-12 bg-[#04061e]">
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "ml-0" : "ml-64"
        )}
      >
        <main className="p-6">
          <div className="flex items-center justify-between mb-4">
            <CreateTutorialDialog onTutorialCreated={handleTutorialCreated} />
            {/* Dropdown for category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0B0D29] text-white px-4 py-2 border border-gray-700 rounded outline-none"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-white text-center">Loading tutorials...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTutorials.map((tutorial) => (
                <div
                  key={tutorial._id}
                  className="p-4 border border-gray-700 rounded bg-gray-900 text-white"
                >
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-full h-48 object-cover rounded"
                  />
                  <h3 className="mt-2 text-lg font-bold">{tutorial.title}</h3>
                  <p className="text-sm text-gray-400">{tutorial.category}</p>
                  <a
                    href={tutorial.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline mt-2 block"
                  >
                    View Tutorial
                  </a>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Tutorials;
