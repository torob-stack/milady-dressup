// /lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lstnauagmbyellmjdbsa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdG5hdWFnbWJ5ZWxsbWpkYnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM2OTAsImV4cCI6MjA2ODY2OTY5MH0.24tJWG7GLAyZNOXA94E90S28flgtic8TyQhNdtUHvJE'; // from Supabase > Project > API
export const supabase = createClient(supabaseUrl, supabaseKey);
