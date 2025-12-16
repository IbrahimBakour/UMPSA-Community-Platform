import React, { useState } from "react";
import CreatePostForm from "./CreatePostForm";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "../utils/helpers";

type CreatePostModalProps = {
  renderTrigger?: (open: () => void) => React.ReactNode;
};

const CreatePostModal = ({ renderTrigger }: CreatePostModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const isRestricted = user?.status === "restricted";

  return (
    <div>
      {renderTrigger ? (
        renderTrigger(openModal)
      ) : (
        <button
          onClick={openModal}
          className="w-full bg-white p-3 text-left text-gray-500 rounded-lg shadow-md mb-4 hover:bg-gray-50 flex items-center gap-3"
          disabled={isRestricted}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {user?.profilePicture ? (
              <img
                src={getMediaUrl(user.profilePicture)}
                alt={user.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-600">
                {user?.nickname?.charAt(0) ?? user?.studentId?.charAt(0) ?? "?"}
              </div>
            )}
          </div>
          <div className="flex-1 text-sm text-gray-600">
            {isRestricted
              ? "You are restricted from creating posts"
              : "What's on your mind?"}
          </div>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "100vh" }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {isRestricted && (
                <div
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                  role="alert"
                >
                  <p className="font-bold">Restricted</p>
                  <p>
                    You are restricted from creating posts. Please contact an
                    administrator for more information.
                  </p>
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
