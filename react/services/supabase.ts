import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ModeOfOperation, Counter, utils } from 'aes-js';
import 'react-native-get-random-values';

// As Expo's SecureStore does not support values larger than 2048
// bytes, an AES-256 key is generated and stored in SecureStore, while
// it is used to encrypt/decrypt values stored in AsyncStorage.
class LargeSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));

    const cipher = new ModeOfOperation.ctr(encryptionKey, new Counter(1));
    const encryptedBytes = cipher.encrypt(utils.utf8.toBytes(value));

    await SecureStore.setItemAsync(key, utils.hex.fromBytes(encryptionKey));

    return utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      return encryptionKeyHex;
    }

    const cipher = new ModeOfOperation.ctr(
      utils.hex.toBytes(encryptionKeyHex),
      new Counter(1)
    );
    const decryptedBytes = cipher.decrypt(utils.hex.toBytes(value));

    return utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) {
      return encrypted;
    }

    return await this._decrypt(key, encrypted);
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);

    await AsyncStorage.setItem(key, encrypted);
  }
}

const supabaseUrl: string = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Create test user in development
if (__DEV__) {
  const createTestUser = async () => {
    const devEmail = process.env.EXPO_PUBLIC_DEV_EMAIL || 'musicroom@gmail.com';
    const devPassword = process.env.EXPO_PUBLIC_DEV_PASSWORD || 'musicroom';
    const devUsername = process.env.EXPO_PUBLIC_DEV_USERNAME || 'musicroom';

    const session = await supabase.auth.getSession();
    if (session) {
      return;
    }
    try {
      // First try to sign up (create new user)
      console.log('🔄 Creating test user...');
      const { error: signUpError } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
        options: {
          data: {
            username: devUsername,
          },
        },
      });

      if (signUpError) {
        // If user already exists, try to sign in
        if (signUpError.message.includes('already registered')) {
          console.log('👤 User already exists, signing in...');
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email: devEmail,
              password: devPassword,
            }
          );

          if (signInError) {
            console.error(
              '❌ Error signing in existing user:',
              signInError.message
            );
          } else {
            console.log('✅ Successfully signed in existing test user');
            console.log(`📧 Email: ${devEmail}`);
            console.log(`👤 Username: ${devUsername}`);
          }
        } else {
          console.error('❌ Error creating test user:', signUpError.message);
        }
      } else {
        console.log('✅ Test user created successfully!');
        console.log(`📧 Email: ${devEmail}`);
        console.log(`🔑 Password: ${devPassword}`);
        console.log(`👤 Username: ${devUsername}`);
      }
    } catch (error) {
      console.error('❌ Unexpected error during user setup:', error);
    }
  };

  // Create test user when Supabase client is initialized
  createTestUser();
}
