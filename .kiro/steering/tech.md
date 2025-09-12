# Music Room - Technical Stack

## Frontend Stack

- **Framework**: React Native with Expo SDK ~53.0
- **Navigation**: Expo Router v5 with file-based routing
- **UI Library**: Gluestack UI components with NativeWind (Tailwind CSS)
- **State Management**: React Context API for auth and profile state
- **Styling**: Tailwind CSS via NativeWind, custom CSS-in-JS components
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated, Legendapp Motion

## Backend Stack

- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with secure token storage
- **API**: Supabase Edge Functions (Deno runtime)
- **File Storage**: Supabase Storage for avatars and media
- **External APIs**: Spotify Web API for music data

## Development Tools

- **Package Manager**: npm
- **Build System**: Expo CLI and EAS Build
- **Code Quality**: ESLint, Prettier, TypeScript
- **Git Hooks**: Husky with lint-staged for pre-commit checks
- **Local Development**: Supabase CLI for local backend

## Key Dependencies

```json
{
  "expo": "~53.0.22",
  "expo-router": "~5.1.5",
  "@supabase/supabase-js": "^2.55.0",
  "react": "19.0.0",
  "react-native": "0.79.5",
  "nativewind": "^4.1.23",
  "tailwindcss": "^3.4.17"
}
```

## Common Commands

### Setup & Installation
```bash
make setup          # Complete project setup
make install        # Install dependencies only
make setup-supabase # Initialize Supabase locally
make setup-env      # Create environment file
```

### Development
```bash
make dev            # Start development server
make start-supabase # Start Supabase services
make migrate        # Apply database migrations
```

### Code Quality
```bash
make lint           # Run ESLint
make format         # Run Prettier
npm run lint:fix    # Auto-fix linting issues
```

### Platform Builds
```bash
make android        # Run on Android
make ios           # Run on iOS
npm run web        # Run on web
```

### Maintenance
```bash
make status        # Check project status
make reset         # Reset database and restart
make clean         # Clean build files
```

## Environment Variables

Required in `react/.env`:
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SECRET_SERVICE_ROLE_KEY`: Supabase service role key
- `SPOTIFY_CLIENT_ID`: Spotify app client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify app secret
