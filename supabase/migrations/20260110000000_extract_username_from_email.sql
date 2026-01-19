-- Update handle_new_user function to extract username from email if not provided
-- This works for Google sign-in and other OAuth providers that don't set username in metadata
create or replace function public.handle_new_user()
returns trigger
set search_path = ''
as $$
declare
  extracted_username text;
  final_username text;
begin
  -- Try to get username from metadata first
  final_username := new.raw_user_meta_data->>'username';
  
  -- If no username in metadata, extract from email (part before @)
  if final_username is null or final_username = '' then
    if new.email is not null and position('@' in new.email) > 0 then
      extracted_username := split_part(new.email, '@', 1);
      
      -- Ensure username meets minimum length requirement (3 characters)
      -- If too short, pad with numbers
      if length(extracted_username) < 3 then
        extracted_username := extracted_username || '123';
      end if;
      
      -- Ensure username doesn't exceed reasonable length (20 chars)
      if length(extracted_username) > 20 then
        extracted_username := substring(extracted_username from 1 for 20);
      end if;
      
      final_username := extracted_username;
    else
      -- Fallback: use a default username if email is also null
      final_username := 'user' || substring(new.id::text from 1 for 8);
    end if;
  end if;
  
  insert into public.profiles (id, username, email)
  values (new.id, final_username, new.email);
  
  return new;
end;
$$ language plpgsql security definer;
