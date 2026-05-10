import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder and resource type based on file type
    let folder = 'nexhire/general';
    let resource_type: 'image' | 'raw' | 'video' | 'auto' = 'auto';

    if (file.mimetype.startsWith('image/')) {
      folder = 'nexhire/profiles';
      resource_type = 'image';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'nexhire/resumes';
      resource_type = 'raw';
    }

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`,
    };
  },
});

export const upload = multer({ storage: storage });
