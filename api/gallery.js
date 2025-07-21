// /pages/api/gallery.js
import { v2 as cloudinary } from 'cloudinary';
import { supabase } from '../../lib/supabaseClient'; // make sure this path is correct

cloudinary.config({
  cloud_name: 'dkoyavida',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    // 1. Get images from Cloudinary folder
    const result = await cloudinary.search
      .expression('folder:milady_submissions')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    // 2. Map image data
    const images = result.resources.map((img) => ({
      id: img.public_id,
      url: img.secure_url,
      alt: img.public_id,
      timestamp: new Date(img.created_at).getTime(),
    }));

    // 3. Get vote counts from Supabase
    const { data: votes } = await supabase
      .from('votes')
      .select('image_id, count:image_id', { count: 'exact' })
      .group('image_id');

    const voteMap = {};
    votes?.forEach((v) => {
      voteMap[v.image_id] = v.count;
    });

    // 4. Attach vote counts to image data
    const enriched = images.map((img) => ({
      ...img,
      votes: voteMap[img.id] || 0,
    }));

    res.status(200).json({ images: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch images' });
  }
}
