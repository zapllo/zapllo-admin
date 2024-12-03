import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import CreateTutorialDialog from "./modals/createTutorial";
import EditTutorialDialog from "./modals/editTutorial";
import DeleteConfirmationDialog from "./modals/deleteConfirmationDialog"; // Import the DeleteConfirmationDialog component
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tutorialToDelete, setTutorialToDelete] = useState<string | null>(null);

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

  const handleTutorialUpdated = (updatedTutorial: any) => {
    setTutorials((prev) =>
      prev.map((tutorial) =>
        tutorial._id === updatedTutorial._id ? updatedTutorial : tutorial
      )
    );
  };

  const handleDelete = async () => {
    if (!tutorialToDelete) return;

    try {
      await axios.delete(`/api/tutorials/${tutorialToDelete}`);
      setTutorials((prev) =>
        prev.filter((tutorial) => tutorial._id !== tutorialToDelete)
      );
      setDeleteDialogOpen(false);
      setTutorialToDelete(null);
    } catch (err) {
      console.error("Failed to delete tutorial:", err);
      setError("Failed to delete tutorial.");
    }
  };

  const openDeleteDialog = (tutorialId: string) => {
    setTutorialToDelete(tutorialId);
    setDeleteDialogOpen(true);
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
                  <div className="flex justify-between mt-2">
                    {/* Edit Tutorial */}
                    <EditTutorialDialog
                      tutorial={tutorial}
                      onTutorialUpdated={handleTutorialUpdated}
                    />
                    {/* Delete Tutorial */}
                    <button
                      onClick={() => openDeleteDialog(tutorial._id)}
                      className="text-red-500 underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Tutorial"
        description="Are you sure you want to delete this tutorial? This action cannot be undone."
      />
    </div>
  );
};

export default Tutorials;
