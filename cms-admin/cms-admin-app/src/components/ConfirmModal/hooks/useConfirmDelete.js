import {useState } from "react";

export default function useConfirmDelete(onConfirm) {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openModal = (item) => {
        setItemToDelete(item);
        setIsOpen(true);
    };

    const closeModal = () => {
        setItemToDelete(null);
        setIsOpen(false);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onConfirm(itemToDelete);
            closeModal();
        }
    };

    return { isOpen, itemToDelete, openModal, closeModal, confirmDelete };
}