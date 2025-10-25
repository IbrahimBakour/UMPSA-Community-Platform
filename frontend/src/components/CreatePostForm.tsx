
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateFeedPost } from '../services/posts';
import { useState } from 'react';
import { FaImage, FaPoll, FaCalendarAlt } from 'react-icons/fa';
import { uploadFile } from '../services/uploads';
import toast from 'react-hot-toast';

const createPostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty'),
  images: z.array(z.string()).optional(),
  poll: z.object({
    question: z.string().min(1, 'Poll question cannot be empty'),
    options: z.array(z.string().min(1, 'Option cannot be empty')).min(2, 'You must have at least two options'),
    allowMultipleVotes: z.boolean(),
    endDate: z.date().optional(),
  }).optional(),
  event: z.object({
    title: z.string().min(1, 'Event title cannot be empty'),
    date: z.string().min(1, 'Event date cannot be empty'),
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    // Transform data to match CreatePostForm type
    const postData = {
      content: data.content,
      media: data.images ? data.images.map(img => new File([], img)) : undefined,
      poll: data.poll ? {
        question: data.poll.question,
        options: pollOptions.filter(opt => opt.trim() !== ''),
        allowMultipleVotes: false,
      } : undefined,
      calendarEvent: data.event ? {
        title: data.event.title,
        date: new Date(data.event.date),
      } : undefined,
    };
    
    createPostMutation.mutate(postData, {
      onSuccess: () => {
        closeModal();
        reset();
        setPollOptions(['', '']);
      }
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newImagePreviews]);

    try {
      const uploadedImageUrls = await Promise.all(files.map(uploadFile));
      setValue('images', [...(imagePreviews || []), ...uploadedImageUrls]);
    } catch (error) {
      toast.error('Failed to upload images. Please try again.');
      setImagePreviews([]);
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

      {postType === 'image' && (
        <div className="mt-4">
          <input type="file" multiple onChange={handleImageChange} accept="image/*" disabled={isUploading} />
          {isUploading && <p>Uploading images...</p>}
          <div className="mt-2 grid grid-cols-3 gap-2">
            {imagePreviews.map((preview, index) => (
              <img key={index} src={preview} alt="preview" className="w-full h-auto rounded-md" />
            ))}
          </div>
        </div>
      )}

      {postType === 'poll' && (
        <div className="mt-4">
          <input {...register('poll.question')} placeholder="Poll Question" className="w-full p-2 border border-gray-300 rounded-md" />
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
                  <button type="button" onClick={() => removePollOption(index)}>Remove</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addPollOption} className="mt-2 text-indigo-600">Add Option</button>
        </div>
      )}

      {postType === 'event' && (
        <div className="mt-4">
          <input {...register('event.title')} placeholder="Event Title" className="w-full p-2 border border-gray-300 rounded-md" />
          {errors.event?.title && <p className="text-red-500 text-sm">{errors.event.title.message}</p>}
          <input type="date" {...register('event.date')} className="mt-2 w-full p-2 border border-gray-300 rounded-md" />
          {errors.event?.date && <p className="text-red-500 text-sm">{errors.event.date.message}</p>}
        </div>
      )}

      <div className="mt-4 flex space-x-4">
        <button type="button" onClick={() => setPostType('image')} className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600">
          <FaImage />
          <span>Image</span>
        </button>
        <button type="button" onClick={() => setPostType('poll')} className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600">
          <FaPoll />
          <span>Poll</span>
        </button>
        <button type="button" onClick={() => setPostType('event')} className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600">
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
