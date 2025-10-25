
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateFeedPost } from '../services/posts';
import { useState } from 'react';
import { FaPoll, FaCalendarAlt } from 'react-icons/fa';
import { uploadFile } from '../services/uploads';
import toast from 'react-hot-toast';

const createPostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty'),
  images: z.array(z.string()).optional(),
  poll: z.object({
    question: z.string().optional(),
    options: z.array(z.string()).optional(),
    allowMultipleVotes: z.boolean().optional(),
    endDate: z.date().optional(),
  }).optional(),
  event: z.object({
    title: z.string().optional(),
    date: z.string().optional(),
  }).optional(),
});

type CreatePostFormInputs = z.infer<typeof createPostSchema>;

const CreatePostForm = ({ closeModal }: { closeModal: () => void }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<CreatePostFormInputs>({
    resolver: zodResolver(createPostSchema),
  });
  const createPostMutation = useCreateFeedPost();
  const [postType, setPostType] = useState<'text' | 'image' | 'poll' | 'event'>('text');
  const [imagePreviews, setImagePreviews] = useState<Array<{ preview: string; url: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (index: number) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const onSubmit = (data: CreatePostFormInputs) => {
    // Transform data to match backend API format
    const postData: any = {
      content: data.content,
      media: data.images || [],
    };

    // Add poll only if poll type is selected AND has complete data
    if (postType === 'poll') {
      const validOptions = pollOptions.filter(opt => opt.trim() !== '');
      const pollQuestion = data.poll?.question?.trim();
      
      // Validate poll data only if trying to create a poll
      if (pollQuestion && validOptions.length >= 2) {
        postData.poll = {
          question: pollQuestion,
          options: validOptions,
          allowMultipleVotes: false,
        };
      } else if (pollQuestion || validOptions.length > 0) {
        // User started filling poll but didn't complete it
        toast.error('Please complete the poll: provide a question and at least 2 options');
        return;
      }
      // If no poll data is provided, just create a regular post
    }

    // Add event only if event type is selected AND has complete data
    if (postType === 'event') {
      const eventTitle = data.event?.title?.trim();
      const eventDate = data.event?.date;
      
      // Validate event data only if trying to create an event
      if (eventTitle && eventDate) {
        postData.calendarEvent = {
          title: eventTitle,
          date: eventDate,
        };
      } else if (eventTitle || eventDate) {
        // User started filling event but didn't complete it
        toast.error('Please complete the event: provide both title and date');
        return;
      }
      // If no event data is provided, just create a regular post
    }
    
    createPostMutation.mutate(postData, {
      onSuccess: () => {
        toast.success('Post created successfully!');
        closeModal();
        reset();
        setPostType('text');
        // Clean up blob URLs
        imagePreviews.forEach(img => URL.revokeObjectURL(img.preview));
        setImagePreviews([]);
        setPollOptions(['', '']);
      },
      onError: () => {
        toast.error('Failed to create post. Please try again.');
      }
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Create preview URLs immediately
    const newPreviews = files.map(file => ({
      preview: URL.createObjectURL(file),
      url: '', // Will be set after upload
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    try {
      // Upload files and get URLs
      const uploadedUrls = await Promise.all(files.map(uploadFile));
      
      // Update previews with actual URLs
      setImagePreviews(prev => {
        const updated = [...prev];
        const startIndex = updated.length - files.length;
        uploadedUrls.forEach((url, index) => {
          updated[startIndex + index] = { ...updated[startIndex + index], url };
        });
        return updated;
      });
      
      // Update form with uploaded URLs
      const allUrls = [...imagePreviews.map(img => img.url), ...uploadedUrls].filter(Boolean);
      setValue('images', allUrls);
    } catch (error) {
      toast.error('Failed to upload images. Please try again.');
      // Remove failed uploads from previews
      setImagePreviews(prev => prev.slice(0, prev.length - files.length));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <textarea
        {...register('content')}
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="What's on your mind?"
      ></textarea>
      {errors.content && (
        <p className="text-red-500 text-sm">{errors.content.message}</p>
      )}

      {/* Images section - available for all post types */}
        <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Add Images (Optional)</label>
        <input 
          type="file" 
          multiple 
          onChange={handleImageChange} 
          accept="image/*" 
          disabled={isUploading}
          className="w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
        {isUploading && <p className="text-sm text-gray-600 mt-2">Uploading images...</p>}
        {imagePreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {imagePreviews.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image.preview} 
                  alt={`preview ${index + 1}`} 
                  className="w-full h-24 object-cover rounded-md border border-gray-300" 
                />
                <button
                  type="button"
                  onClick={() => {
                    const newPreviews = imagePreviews.filter((_, i) => i !== index);
                    setImagePreviews(newPreviews);
                    const newUrls = newPreviews.map(img => img.url).filter(Boolean);
                    setValue('images', newUrls);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        </div>

      {postType === 'poll' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Poll (Optional - Leave blank for regular post)</p>
          <input 
            {...register('poll.question')} 
            placeholder="Poll Question (Optional)" 
            className="w-full p-2 border border-gray-300 rounded-md" 
          />
          {errors.poll?.question && <p className="text-red-500 text-sm">{errors.poll.question.message}</p>}
          <div className="mt-2 space-y-2">
            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input 
                  value={option}
                  onChange={(e) => updatePollOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`} 
                  className="w-full p-2 border border-gray-300 rounded-md" 
                />
                {pollOptions.length > 2 && (
                  <button 
                    type="button" 
                    onClick={() => removePollOption(index)}
                    className="px-2 py-1 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={addPollOption} 
            className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm"
          >
            + Add Option
          </button>
        </div>
      )}

      {postType === 'event' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Event (Optional - Leave blank for regular post)</p>
          <input 
            {...register('event.title')} 
            placeholder="Event Title (Optional)" 
            className="w-full p-2 border border-gray-300 rounded-md" 
          />
          {errors.event?.title && <p className="text-red-500 text-sm">{errors.event.title.message}</p>}
          <input 
            type="date" 
            {...register('event.date')} 
            className="mt-2 w-full p-2 border border-gray-300 rounded-md" 
          />
          {errors.event?.date && <p className="text-red-500 text-sm">{errors.event.date.message}</p>}
        </div>
      )}

      <div className="mt-4 flex space-x-4">
        <button 
          type="button" 
          onClick={() => setPostType('text')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            postType === 'text' 
              ? 'bg-indigo-600 text-white' 
              : 'text-gray-600 hover:bg-indigo-50'
          }`}
        >
          <span>Text</span>
        </button>
        <button 
          type="button" 
          onClick={() => setPostType('poll')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            postType === 'poll' 
              ? 'bg-indigo-600 text-white' 
              : 'text-gray-600 hover:bg-indigo-50'
          }`}
        >
          <FaPoll />
          <span>Poll</span>
        </button>
        <button 
          type="button" 
          onClick={() => setPostType('event')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            postType === 'event' 
              ? 'bg-indigo-600 text-white' 
              : 'text-gray-600 hover:bg-indigo-50'
          }`}
        >
          <FaCalendarAlt />
          <span>Event</span>
        </button>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          onClick={closeModal}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={createPostMutation.isPending || isUploading}
        >
          {createPostMutation.isPending ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

export default CreatePostForm;
