# Music Room Project

A React Native mobile application built with Expo and Supabase, featuring user authentication, profile management, and a modern UI design.

## 📋 Prerequisites

Before you begin, install the required CLI tools:

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install Supabase CLI globally
npm install -g supabase
```

## 🚀 Quick Start

The easiest way to get started is using the included Makefile:

```bash
# Complete project setup (recommended for first time)
make setup

# Start the development server
make dev

# See all available commands
make help
```


## 📁 Project Structure

```
music-room/
├── react/                  # React Native/Expo app
│   ├── app/               # Expo Router pages
│   │   ├── _layout.tsx    # Root layout
│   │   ├── (auth)/        # Authentication routes
│   │   └── (main)/        # Main app routes
│   ├── components/        # UI components
│   │   └── ui/            # Gluestack UI components
│   ├── contexts/          # React Context providers
│   ├── config/            # Configuration files
│   ├── hooks/             # Custom React hooks
│   ├── assets/            # Images and static files

│
├── project_documentation/ # Design documentation
│
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── config.toml       # Supabase settings
├── Makefile              # Automation scripts
└── README.md             # This file
```

## App screen roughs

See music room application's first shapes [here](./project_documentation/app_screens_roughs.md).

## 🛠️ Available Commands

### **Setup & Installation**

- `make setup` - Complete project setup
- `make install` - Install dependencies
- `make setup-supabase` - Initialize Supabase
- `make setup-env` - Create environment file

### **Development**

- `make start-supabase` - Start Supabase + apply migrations
- `make dev` - Start Expo development server
- `make migrate` - Apply migrations manually

### **Maintenance**

- `make status` - Check project status
- `make reset` - Reset database and restart
- `make clean` - Clean up build files
- `make help` - Show all commands

## 🌐 Environment Configuration

The Makefile automatically:

- ✅ Detects your local IP address
- ✅ Creates `.env` file with correct Supabase URL
- ✅ Uses local IP instead of `127.0.0.1` (mobile compatibility)

## 🚨 Troubleshooting

### **Tables Not Created**

```bash
# Check migration status
make status

# Manually apply migrations
make migrate

# Reset and restart
make reset
```

### **Connection Issues**

- Ensure you're using local IP, not `127.0.0.1`
- Verify Supabase services are running: `make status`
- Check `.env` file configuration, input anon and url key manually if needed

### **Database Reset**

```bash
# Complete reset
make reset
```


## 🔄 Adding New Tables

To add new tables:

1. **Create Migration**:

   ```bash
   npx supabase migration new table_name
   ```

2. **Edit Migration File** in `supabase/migrations/`

3. **Apply Migration**:
   ```bash
   make migrate
   ```

### Use Spotify

## 🎵 How to Connect Your Application to Spotify

### 1. Create a Spotify Developer Application

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Log in with your Spotify account.
3. Click **Create an App**.
4. Fill in the app details:
   - **App Name**: Choose a name for your app.
   - **App Description**: Briefly describe your app.
5. Specify the Redirect URI(s) for OAuth callbacks (e.g., `https://localhost:54321/functions/v1/auth/spotify/callback`).
6. Accept the Developer Terms of Service and create the app.
7. After creation, note your **Client ID** and **Client Secret**—you’ll need these for authentication.

### 2. Add Environment Variables

Add the following key-value pairs to your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=http://10.11.6.4:54321
LOCAL_SUPABASE_URL=http://kong:8000
API_BASE_URL=https://04af8d63ed79.ngrok-free.app
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SECRET_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

- `EXPO_PUBLIC_SUPABASE_URL` and `LOCAL_SUPABASE_URL`: URLs for your Supabase instances.
- `API_BASE_URL`: Your external API base URL (e.g., ngrok URL).
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon (public) key.
- `SECRET_SERVICE_ROLE_KEY`: Supabase service role key for privileged operations.
- `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`: Credentials from your Spotify developer app.

With these variables set, your application will be ready to securely authenticate and interact with the Spotify API.

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)

