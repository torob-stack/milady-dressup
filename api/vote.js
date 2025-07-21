// /api/vote.js
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { serialize } from 'cookie';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: image_id } = req.body;

  if (!image_id) {
    return res.status(400).json({ error: 'Missing image ID' });
  }

  // Get client cookie or assign one
  const cookies = req.headers.cookie || '';
  const parsed = Object.fromEntries(cookies.split('; ').map(c => c.split('=')));
  let cookie_id = parsed['milady_vote_id'];

  if (!cookie_id) {
    cookie_id = uuidv4();
    res.setHeader('Set-Cookie', serialize('milady_vote_id', cookie_id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    }));
  }

  // Check if vote already exists
  const { data: existingVote, error: checkError } = await supabase
    .from('votes')
    .select('*')
    .eq('image_id', image_id)
    .eq('cookie_id', cookie_id)
    .maybeSingle();

  if (checkError) {
    console.error(checkError);
    return res.status(500).json({ error: 'Database read failed' });
  }

  if (existingVote) {
    return res.status(200).json({ success: false, message: 'Already voted' });
  }

  // Insert new vote
  const { error: insertError } = await supabase.from('votes').insert({
    image_id,
    cookie_id,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
  });

  if (insertError) {
    console.error(insertError);
    return res.status(500).json({ error: 'Vote failed' });
  }

  return res.status(200).json({ success: true });
}
