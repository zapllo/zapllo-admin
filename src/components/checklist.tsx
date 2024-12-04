'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { AddChecklistItemDialog } from "@/components/modals/createChecklistDialog";
import { EditChecklistItemDialog } from "@/components/modals/editChecklist";

interface ChecklistItem {
    _id: string;
    text: string;
    tutorialLink?: string;
    category?: string;
}

const categoryOptions = [
    "All",
    "Task Delegation App",
    "Leave and Attendance App",
    "Zapllo WABA",
];

type AdminSidebarProps = {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AdminChecklistPanel({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    useEffect(() => {
        fetchChecklistItems();
    }, []);

    const fetchChecklistItems = async () => {
        try {
            const res = await axios.get<{ checklistItems: ChecklistItem[] }>("/api/checklist/get");
            setChecklistItems(res.data.checklistItems || []);
        } catch (error) {
            console.error("Error fetching checklist items:", error);
        }
    };

    const handleAddChecklistItem = async (item: {
        text: string;
        tutorialLink?: string;
        category: string;
    }) => {
        try {
            setIsLoading(true);
            const res = await axios.post<{ checklistItem: ChecklistItem }>("/api/checklist/create", item);
            setChecklistItems((prev) => [...prev, res.data.checklistItem]);
        } catch (error) {
            console.error("Error adding checklist item:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteChecklistItem = async (id: string) => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/checklist/${id}`);
            setChecklistItems((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            console.error("Error deleting checklist item:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditChecklistItem = async (id: string, updatedItem: Partial<ChecklistItem>) => {
        try {
            setIsLoading(true);
            const res = await axios.patch<{ checklistItem: ChecklistItem }>(`/api/checklist/${id}`, updatedItem);
            setChecklistItems((prev) =>
                prev.map((item) => (item._id === id ? res.data.checklistItem : item))
            );
        } catch (error) {
            console.error("Error editing checklist item:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredChecklist =
        selectedCategory === "All"
            ? checklistItems
            : checklistItems.filter((checklist) => checklist.category === selectedCategory);

    return (
        <div className="p-8 bg-[#04061E] h-screen">
            {/* <h1 className="text-2xl font-bold mb-4">Checklist Admin Panel</h1> */}
            <div className="flex justify-between">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#0B0D29] mt-12 text-white px-4 py-2 border border-gray-700 rounded outline-none mb-4"
                >
                    {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <div className="mt-12">
                    <AddChecklistItemDialog
                        onAddChecklistItem={handleAddChecklistItem}
                        categories={categoryOptions}
                    />
                </div>
            </div>
            <div>
                <h2 className="text-lg font-semibold mb-2">Existing Checklist Items</h2>
                {filteredChecklist.map((item) => (
                    <div key={item._id} className="p-4 border border-gray-800 text-white rounded mb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <p>{item.text}</p>
                                {item.tutorialLink && (
                                    <a href={item.tutorialLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                        Tutorial
                                    </a>
                                )}
                                <p className="text-sm text-gray-500">Category: {item.category || "Uncategorized"}</p>
                            </div>
                            <div className="space-x-4">
                                <EditChecklistItemDialog
                                    item={item}
                                    categories={categoryOptions}
                                    onSave={handleEditChecklistItem}
                                />
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteChecklistItem(item._id)}
                                    disabled={isLoading}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
