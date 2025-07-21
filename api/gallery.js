// /api/gallery.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    // Get image submissions
    const { data: images, error } = await supabase
      .from('submissions')
      .select('image_id, url, timestamp');

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to load images' });
    }

    // Get vote counts
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .select('image_id, count')
      .group('image_id');

    const voteMap = {};
    voteData?.forEach(v => {
      voteMap[v.image_id] = v.count;
    });

    const enriched = images.map(img => ({
      id: img.image_id,
      url: img.url,
      timestamp: new Date(img.timestamp).getTime(),
      votes: voteMap[img.image_id] || 0
    }));

    res.status(200).json({ images: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch images' });
  }
}
