'use client'

import { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AddChecklistItemDialogProps {
    onAddChecklistItem: (item: { text: string; tutorialLink?: string; category: string }) => void;
    categories: string[];
}

export function AddChecklistItemDialog({
    onAddChecklistItem,
    categories,
}: AddChecklistItemDialogProps) {
    const [text, setText] = useState<string>("");
    const [tutorialLink, setTutorialLink] = useState<string>("");
    const [category, setCategory] = useState<string>(categories[0] || "All");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async () => {
        if (!text) {
            alert("Checklist text is required.");
            return;
        }

        setIsSubmitting(true);

        try {
            await onAddChecklistItem({ text, tutorialLink, category });
            setText("");
            setTutorialLink("");
            setCategory(categories[0] || "All");
        } catch (error) {
            console.error("Error adding checklist item:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add Checklist Item</Button>
            </DialogTrigger>
            <DialogContent className="text-white p-6">
                <div className="flex justify-between items-center">
                    <DialogHeader>
                        <DialogTitle>Add Checklist Item</DialogTitle>
                    </DialogHeader>
                    <DialogClose asChild>
                        <X className="text-white cursor-pointer" />
                    </DialogClose>
                </div>
                <div className="p-4 space-y-4">
                    <input
                        type="text"
                        placeholder="Checklist text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-2 border border-gray-800 outline-none  rounded bg-[#0B0D29] text-white"
                    />
                    <input
                        type="text"
                        placeholder="Tutorial link (optional)"
                        value={tutorialLink}
                        onChange={(e) => setTutorialLink(e.target.value)}
                        className="w-full p-2 border border-gray-800 outline-none  rounded bg-[#0B0D29] text-white"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border border-gray-800 outline-none  rounded bg-[#0B0D29] text-white"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#017a5b] w-full hover:bg-[#017a7c] text-white"
                    >
                        {isSubmitting ? "Adding..." : "Add"}
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
