import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avrgbrfifinznopcdvev.supabase.co'; // Substitua pela sua URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cmdicmZpZmluem5vcGNkdmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTE5ODcsImV4cCI6MjA1NzcyNzk4N30.9eP2mOOQjZ6wy3YW1JgGBWVgHzPEE0WqSe-fOCBGyiY'; // Substitua pela sua chave pública (anon key)

export const supabase = createClient(supabaseUrl, supabaseKey);