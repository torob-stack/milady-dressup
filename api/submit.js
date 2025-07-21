// /api/submit.js
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // must be service role key
);

cloudinary.config({
  cloud_name: 'dkoyavida',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageData } = req.body;
  if (!imageData) return res.status(400).json({ error: 'No image data provided' });

  try {
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'milady_submissions',
          upload_preset: 'milady_drawings',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // insert into Supabase
    const { data, error } = await supabase.from('submissions').insert([
      {
        image_id: result.public_id,
        url: result.secure_url,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
}
