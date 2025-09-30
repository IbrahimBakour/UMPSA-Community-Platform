
import RestrictUserForm from './RestrictUserForm';
import { motion, AnimatePresence } from 'framer-motion';

interface RestrictUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const RestrictUserModal = ({ isOpen, onClose, userId }: RestrictUserModalProps) => {
  return (
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
            <h2 className="text-xl font-bold mb-4">Restrict User</h2>
            <RestrictUserForm userId={userId} closeModal={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestrictUserModal;
