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

interface EditChecklistItemDialogProps {
    item: { _id: string; text: string; tutorialLink?: string; category?: string };
    categories: string[];
    onSave: (id: string, updatedItem: { text: string; tutorialLink?: string; category: string }) => void;
}

export function EditChecklistItemDialog({
    item,
    categories,
    onSave,
}: EditChecklistItemDialogProps) {
    const [text, setText] = useState<string>(item.text);
    const [tutorialLink, setTutorialLink] = useState<string>(item.tutorialLink || "");
    const [category, setCategory] = useState<string>(item.category || categories[0]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await onSave(item._id, { text, tutorialLink, category });
        } catch (error) {
            console.error("Error saving checklist item:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Edit</Button>
            </DialogTrigger>
            <DialogContent className="text-white p-6">
                <div className="flex justify-between items-center">
                    <DialogHeader>
                        <DialogTitle>Edit Checklist Item</DialogTitle>
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
                        className="w-full p-2 border rounded bg-[#0B0D29] text-white"
                    />
                    <input
                        type="text"
                        placeholder="Tutorial link (optional)"
                        value={tutorialLink}
                        onChange={(e) => setTutorialLink(e.target.value)}
                        className="w-full p-2 border rounded bg-[#0B0D29] text-white"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border rounded bg-[#0B0D29] text-white"
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
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="bg-[#017a5b] hover:bg-[#017a7c] w-full text-white"
                    >
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
