// Import required libraries and modules
import { assert, assertEquals } from 'jsr:@std/assert@1'
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'

// Will load the .env file to Deno.env
import 'jsr:@std/dotenv/load'

// Set up the configuration for the Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
}
const client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options)

// Verify if the Supabase URL and key are provided
if (!supabaseUrl) throw new Error('supabaseUrl is required.')
if (!supabaseKey) throw new Error('supabaseKey is required.')


// Test the creation and functionality of the Supabase client
const testClientCreation = async () => {

  // Test a simple query to the database
  const { data: table_data, error: table_error } = await client
    .from('events')
    .select('*')
    .limit(1)
  if (table_error) {
    throw new Error('Invalid Supabase client: ' + table_error.message)
  }
  assert(table_data, 'Data should be returned from the query.')
}

const testEventMembersTableCreation = async () => {
  const { data: table_data, error: table_error } = await client
    .from('event_members')
    .select('*')
    .limit(1)
  if (table_error) {
    throw new Error('Invalid Supabase client: ' + table_error.message)
  }
  assert(table_data, 'Data should be returned from the query.')
}

const testFollowsTableCreation = async () => {
  const { data: table_data, error: table_error } = await client
    .from('follows')
    .select('*')
    .limit(1)
  if (table_error) {
    throw new Error('Invalid Supabase client: ' + table_error.message)
  }
  assert(table_data, 'Data should be returned from the query.')
}

const testPlaylistsTableCreation = async () => {
  const { data: table_data, error: table_error } = await client
    .from('playlists')
    .select('*')
    .limit(1)
  if (table_error) {
    throw new Error('Invalid Supabase client: ' + table_error.message)
  }
  assert(table_data, 'Data should be returned from the query.')
}

const testProfilesTableCreation = async () => {
  const { data: table_data, error: table_error } = await client
    .from('profiles')
    .select('*')
    .limit(1)
  if (table_error) {
    throw new Error('Invalid Supabase client: ' + table_error.message)
  }
  assert(table_data, 'Data should be returned from the query.')
}


// Register and run the tests
Deno.test('Client Creation Test', testClientCreation)
Deno.test('Event members table creation', testEventMembersTableCreation)
Deno.test('Playlists table creation', testPlaylistsTableCreation)
Deno.test('Profiles table creation', testProfilesTableCreation)
Deno.test('Follows table creation', testFollowsTableCreation)
