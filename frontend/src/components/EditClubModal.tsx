
import { useState } from 'react';
import EditClubForm from './EditClubForm';
import { Club } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface EditClubModalProps {
  club: Club;
}

const EditClubModal = ({ club }: EditClubModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4"
          >
            <motion.div
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "100vh" }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg my-8"
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
