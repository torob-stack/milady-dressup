// /api/gallery.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dkoyavida',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    const result = await cloudinary.search
      .expression('folder:milady_submissions')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const images = result.resources.map((img) => ({
      url: img.secure_url,
      alt: img.public_id,
    }));

    res.status(200).json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch images' });
  }
}
