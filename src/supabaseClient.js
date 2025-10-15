// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';



const supabaseUrl = 'https://pjbzxrtrbywwbzuukcsz.supabase.co';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnp4cnRyYnl3d2J6dXVrY3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNTM0MDEsImV4cCI6MjA3NDYyOTQwMX0.DQZ5v70L61SWP-t_veYphHu9tocQbIJP_txQJIc3kiQ';



export const supabase = createClient(supabaseUrl, supabaseAnonKey);