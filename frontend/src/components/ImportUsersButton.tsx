import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importUsers } from '../services/auth';
import toast from 'react-hot-toast';

const ImportUsersButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: importUsers,
    onSuccess: (data) => {
      setIsUploading(false);
      const successfulCount = data.details?.successful || 0;
      
      if (data.errors && data.errors.length > 0) {
        // Check if errors are due to existing users
        const existingUsersCount = data.errors.filter(error => 
          error.toLowerCase().includes('already exists')
        ).length;
        
        if (existingUsersCount > 0 && successfulCount === 0 && existingUsersCount === data.errors.length) {
          // All users already exist
          toast.error(`${existingUsersCount} ${existingUsersCount === 1 ? 'user already' : 'users already'} exist in the system`, { duration: 5000 });
        } else if (existingUsersCount > 0) {
          // Some new, some existing
          const newErrorsCount = data.errors.length - existingUsersCount;
          let message = `Successfully imported ${successfulCount} users. `;
          if (existingUsersCount > 0) {
            message += `${existingUsersCount} ${existingUsersCount === 1 ? 'user already exists' : 'users already exist'}. `;
          }
          if (newErrorsCount > 0) {
            message += `${newErrorsCount} ${newErrorsCount === 1 ? 'error occurred' : 'errors occurred'}.`;
          }
          toast(message, { 
            duration: 6000,
            icon: '⚠️',
            style: {
              background: '#fbbf24',
              color: '#fff',
            }
          });
        } else {
          // Other errors
          toast.error(
            `Successfully imported ${successfulCount} users, but ${data.errors.length} errors occurred`,
            { duration: 5000 }
          );
        }
      } else {
        // All succeeded
        toast.success(`Successfully imported ${successfulCount} users!`);
      }
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast.error(error.response?.data?.message || 'Failed to import users. Please try again.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setIsUploading(true);
    importMutation.mutate(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".xlsx,.xls"
        className="hidden"
        disabled={isUploading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <span className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Importing...
          </span>
        ) : (
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Import Users
          </span>
        )}
      </button>
    </>
  );
};

export default ImportUsersButton;
