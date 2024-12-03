'use client'

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Delete",
    description = "Are you sure you want to delete this item? This action cannot be undone."
}) => {
      console.log('isOpen in Dialog:', isOpen); // Log to confirm the isOpen prop is being passed correctly
    return (    
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed z-[100] inset-0 bg-black opacity-50" />
                <Dialog.Content className="fixed inset-1/2 w-[90vw] max-w-md transform -translate-x-1/2 -translate-y-1/2 bg-[#0B0D29] z-[100]  max-h-3xl h-fit text-white  rounded-lg p-8">
                    <Dialog.Title className="text-lg font-medium">{title}</Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-white -500">{description}</Dialog.Description>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button
                            className="px-4 py-2 text-sm border  rounded-md"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md"
                            onClick={onConfirm}
                        >
                            Delete
                        </button>
                    </div>
                    <Dialog.Close asChild>
                        <button className="absolute top-2.5 right-2.5 p-1.5">
                            <X />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default DeleteConfirmationDialog;
