import { useState, useEffect } from "react";
import EditClubForm from "./EditClubForm";
import { Club } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface EditClubModalProps {
  club: Club;
}

const EditClubModal = ({ club }: EditClubModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div>
      <button
        onClick={openModal}
        className="mr-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Edit Club
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-hidden p-4"
          >
            <motion.div
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{
                duration: 0.3,
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-4">Edit Club</h2>
              <EditClubForm club={club} closeModal={closeModal} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditClubModal;
