import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Multer for file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware for handling file uploads
export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload failed.' });
        }
        next();
    });
};

// Middleware for uploading to Cloudinary
export const uploadToCloudinary = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next();
    }

    try {
        const result = await cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ error: 'Cloudinary upload failed.' });
                }
                req.fileUrl = result.secure_url; // Store the file URL in the request object
                next();
            }
        );

        req.file.stream.pipe(result);
    } catch (error) {
        return res.status(500).json({ error: 'Cloudinary upload failed.' });
    }
};