import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary.js';

export const branchPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:            'medil/branches',
    allowed_formats:   ['jpg', 'jpeg', 'png', 'webp'],
    transformation:    [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
  },
});

export const professionalPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'medil/professionals',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

export const patientPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'medil/patients',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

export const uploadBranchPhoto      = multer({ storage: branchPhotoStorage });
export const uploadProfessionalPhoto = multer({ storage: professionalPhotoStorage });
export const uploadPatientPhoto      = multer({ storage: patientPhotoStorage });
