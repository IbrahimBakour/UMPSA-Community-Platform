
import { useState } from 'react';
import CreatePostForm from './CreatePostForm';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePostModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const isRestricted = user?.status === 'restricted';

  return (
    <div>
      <button
        onClick={openModal}
        className="w-full bg-white p-4 text-left text-gray-500 rounded-lg shadow-md mb-4 hover:bg-gray-50"
        disabled={isRestricted}
      >
        {isRestricted ? "You are restricted from creating posts" : "What's on your mind?"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "100vh" }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
            >
              {isRestricted && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                  <p className="font-bold">Restricted</p>
                  <p>You are restricted from creating posts. Please contact an administrator for more information.</p>
                </div>
              )}
              <h2 className="text-xl font-bold mb-4">Create Post</h2>
              <CreatePostForm closeModal={closeModal} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreatePostModal;
