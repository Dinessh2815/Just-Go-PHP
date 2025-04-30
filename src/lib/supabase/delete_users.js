import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://prndpljpzlzbcpitnruc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybmRwbGpwemx6YmNwaXRucnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4ODE4NTQsImV4cCI6MjA1NjQ1Nzg1NH0.nzGOlGr2lvslB_B_p1-0CBK45rC2xEU1QAf-ZTzbECs"
);

async function deleteAllUsers() {
  const { data: users, error: fetchError } = await supabase
    .from("auth.users")
    .select("id");

  if (fetchError) {
    console.error("Error fetching users:", fetchError.message);
    return;
  }

  for (const user of users) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );
    if (deleteError) {
      console.error(`Error deleting user ${user.id}:`, deleteError.message);
    } else {
      console.log(`Deleted user ${user.id}`);
    }
  }
}

deleteAllUsers();
