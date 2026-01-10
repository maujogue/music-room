-- Add function to handle user updates (Google Sign-In data sync)
create or replace function public.handle_user_update()
returns trigger
set search_path = ''
as $$
begin
  -- Update profile with Google data if it exists and profile fields are empty
  if new.raw_user_meta_data->>'avatar_url' is not null
     and new.raw_user_meta_data->>'full_name' is not null then
    update public.profiles
    set
      avatar_url = coalesce(avatar_url, new.raw_user_meta_data->>'avatar_url'),
      username = coalesce(username, new.raw_user_meta_data->>'full_name')
    where id = new.id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for UPDATE operations on auth.users
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();
