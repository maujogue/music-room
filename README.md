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

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)

