// /api/gallery.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const { data: submissions, error: submissionErr } = await supabase
      .from('submissions')
      .select('*');

    if (submissionErr) throw submissionErr;

    const { data: votes, error: voteErr } = await supabase
      .from('votes')
      .select('image_id');

    if (voteErr) throw voteErr;

    const voteMap = {};
    votes.forEach(v => {
      voteMap[v.image_id] = (voteMap[v.image_id] || 0) + 1;
    });

    const images = submissions.map(img => ({
      id: img.image_id,
      url: img.url,
      timestamp: new Date(img.timestamp).getTime(),
      votes: voteMap[img.image_id] || 0,
    }));

    res.status(200).json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch images' });
  }
}
