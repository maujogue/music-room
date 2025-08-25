# Music Room Project

A React Native mobile application built with Expo and Supabase, featuring user authentication, profile management, and a modern UI design.

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

## 📋 What Gets Created Automatically

When you run `make start-supabase`, the following happens automatically:

1. **🚀 Supabase Services Start** - Database, Auth, and API services
2. **🔄 Migrations Applied** - Database tables and structure created
3. **🌱 Seed Data Applied** - Initial data populated (if configured)
4. **✅ Tables Ready** - Your app can immediately start using the database

## 🗄️ Database Tables Created

The migrations automatically create:

### **Profiles Table**

```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### **Features**

- ✅ **Row Level Security (RLS)** enabled
- ✅ **Automatic profile creation** when users sign up
- ✅ **Secure policies** - users can only access their own data
- ✅ **Storage bucket** for avatar images

## 🔧 How It Works

### **1. Migration Files**

Located in `supabase/migrations/`:

- `20250821065711_user_management_starter.sql` - Initial setup
- `20250821065712_profiles_table_update.sql` - App-specific structure

### **2. Automatic Execution**

- Migrations run automatically on `supabase start`
- Tables are created/updated without manual intervention
- Seed data is applied if present

### **3. Database Reset**

```bash
# Reset database and reapply migrations
make reset

# Reset database only (keep services running)
make reset-db
```

## 📁 Project Structure

```
music-room/
├── app/                    # React Native/Expo app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── contexts/      # React Context providers
│   │   ├── lib/          # Supabase configuration
│   │   ├── navigation/   # App navigation
│   │   └── screens/      # App screens
│   └── package.json
│   
├── project_documentation/ # More things to read
│   
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   ├── seed.sql          # Initial data
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
- `make start-app` - Start Expo development server
- `make dev` - Start both services
- `make migrate` - Apply migrations manually

### **Maintenance**

- `make status` - Check project status
- `make reset` - Reset database and restart
- `make clean` - Clean up build files
- `make help` - Show all commands

## 🔐 Authentication Flow

1. **User Registration** → Creates auth.users record
2. **Trigger Fires** → Automatically creates profiles record
3. **Profile Ready** → User can immediately access their profile
4. **Secure Access** → RLS policies ensure data privacy

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
- Check `.env` file configuration

### **Database Reset**

```bash
# Complete reset
make reset

# Database only
make reset-db
```

## 📱 Testing the App

1. **Start Services**: `make start-supabase`
2. **Start App**: `make start-app`
3. **Test on Device**: Scan QR code with Expo Go
4. **Verify Tables**: Check connection status in the app

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**🎵 Your Music Room app is now ready with automatic table creation!**
