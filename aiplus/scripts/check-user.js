const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
  const email = 'ymfm2025@gmail.com';
  const userId = 'fbgchannel01';

  console.log('Checking user with email:', email);
  const emailResult = await supabase
    .from('app_users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  
  console.log('Email search result:', JSON.stringify(emailResult, null, 2));

  console.log('\nChecking user with user_id:', userId);
  const userIdResult = await supabase
    .from('app_users')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  console.log('User ID search result:', JSON.stringify(userIdResult, null, 2));

  console.log('\nAll users:');
  const allUsers = await supabase
    .from('app_users')
    .select('id, user_id, email, phone_number, is_email_verified, is_phone_verified, created_at');
  
  console.log('All users result:', JSON.stringify(allUsers, null, 2));
}

checkUser().catch(console.error);
