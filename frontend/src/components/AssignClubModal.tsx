
import { useState } from 'react';
import AssignClubForm from './AssignClubForm';

interface AssignClubModalProps {
  userId: string;
}

const AssignClubModal = ({ userId }: AssignClubModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div>
      <button
        onClick={openModal}
        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Assign to Club
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Assign User to Club</h2>
            <AssignClubForm userId={userId} closeModal={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignClubModal;
