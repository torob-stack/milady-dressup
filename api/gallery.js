// /api/gallery.js
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

cloudinary.config({
  cloud_name: 'dkoyavida',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const result = await cloudinary.search
      .expression('folder:milady_submissions')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const images = await Promise.all(
      result.resources.map(async (img) => {
        const { data, error } = await supabase
          .from('votes')
          .select('count')
          .eq('image_id', img.public_id)
          .single();

        return {
          id: img.public_id,
          url: img.secure_url,
          timestamp: new Date(img.created_at).getTime(),
          votes: data?.count || 0,
        };
      })
    );

    res.status(200).json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch images' });
  }
}
