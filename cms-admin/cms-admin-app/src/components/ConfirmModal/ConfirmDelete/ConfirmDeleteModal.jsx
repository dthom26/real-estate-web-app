import { useEffect } from "react";
import styles from "./ConfirmDeleteModal.module.css";

const ConfirmDeleteModal = ({ onConfirm, onClose, isOpen }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className={styles["confirm-modal-overlay"]} onClick={onClose}>
      <div
        className={styles["confirm-modal"]}
        onClick={(e) => e.stopPropagation()}
      >
        <p>Are you sure you want to delete this item?</p>
        <button onClick={onConfirm}>Yes, Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
