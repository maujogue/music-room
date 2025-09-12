# Music Room - Project Structure

## Root Directory Layout

```
music-room/
├── react/                  # React Native/Expo application
├── supabase/              # Backend services and database
├── project_documentation/ # Design docs and mockups
├── Makefile              # Development automation
└── package.json          # Root project configuration
```

## React Native App Structure (`react/`)

### Core Application
```
react/
├── app/                   # Expo Router pages (file-based routing)
│   ├── _layout.tsx       # Root layout with providers
│   ├── (auth)/           # Authentication routes (login, register)
│   └── (main)/           # Protected main app routes
│       ├── index.tsx     # Home screen
│       ├── events/       # Event management screens
│       ├── playlists/    # Playlist management screens
│       └── profile/      # User profile screens
├── components/           # Reusable UI components
│   ├── ui/              # Gluestack UI component library
│   ├── events/          # Event-specific components
│   ├── playlist/        # Playlist-specific components
│   ├── profile/         # Profile-specific components
│   ├── track/           # Music track components
│   ├── player/          # Music player components
│   └── generics/        # Generic/shared components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── services/            # API services and external integrations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── assets/              # Static assets (images, fonts)
```

### Configuration Files
```
react/
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── metro.config.js      # Metro bundler configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── eslint.config.js     # ESLint configuration
├── .prettierrc          # Prettier configuration
└── .env                 # Environment variables
```

## Supabase Backend Structure (`supabase/`)

```
supabase/
├── functions/           # Edge Functions (API endpoints)
│   ├── auth/           # Authentication endpoints
│   ├── events/         # Event management API
│   ├── playlists/      # Playlist management API
│   ├── profile/        # User profile API
│   ├── me/             # Current user API
│   └── search/         # Search functionality
├── migrations/         # Database schema migrations
├── types/              # TypeScript types for database
├── utils/              # Shared utilities
└── config.toml         # Supabase configuration
```

## Architectural Patterns

### File-Based Routing
- Uses Expo Router v5 with file-based routing
- Route groups: `(auth)` for authentication, `(main)` for protected routes
- Dynamic routes: `[id].tsx` for parameterized pages
- Layout files: `_layout.tsx` for nested layouts

### Component Organization
- **Feature-based**: Components grouped by domain (events, playlists, profile)
- **UI Library**: Gluestack UI components in `components/ui/`
- **Generic Components**: Reusable components in `components/generics/`
- **Atomic Design**: Components range from atoms to organisms

### State Management
- **Context API**: Used for global state (auth, profile)
- **Custom Hooks**: Business logic encapsulated in hooks
- **Local State**: Component-level state with useState/useReducer

### API Layer
- **Services**: API calls organized by domain in `services/`
- **Supabase Client**: Centralized client configuration
- **Edge Functions**: Backend logic in Supabase functions
- **Type Safety**: Shared types between frontend and backend

### Styling Approach
- **NativeWind**: Tailwind CSS for React Native
- **Gluestack UI**: Component library with consistent design system
- **Custom Styles**: CSS-in-JS for complex styling needs
- **Responsive Design**: Mobile-first approach with breakpoints

## Naming Conventions

### Files and Directories
- **PascalCase**: React components (`UserProfile.tsx`)
- **camelCase**: Utilities, hooks, services (`useAuth.tsx`, `apiClient.ts`)
- **kebab-case**: Configuration files (`tailwind.config.js`)
- **lowercase**: Directories (`components/`, `services/`)

### Code Conventions
- **Interfaces**: Prefix with `I` or suffix with `Type` (`IUser`, `UserType`)
- **Enums**: PascalCase (`UserRole`, `EventStatus`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Functions**: camelCase with descriptive names (`getUserPlaylists`)

## Import Patterns

### Path Aliases
```typescript
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/authCtx'
import { supabase } from '@/services/supabase'
```

### Import Order
1. React and React Native imports
2. Third-party libraries
3. Internal components and utilities
4. Type imports (with `type` keyword)
5. Relative imports
