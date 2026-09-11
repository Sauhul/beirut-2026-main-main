import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg";
const BUCKET = "productos";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function listFiles() {
  const { data, error } = await supabase.storage.from(BUCKET).list();
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Archivos en bucket:", data.map(f => f.name));
  }
}

listFiles();
