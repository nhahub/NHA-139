# WhereToGo - Local Business Directory

A modern, full-featured listing directory application built with React, TypeScript, and Tailwind CSS. Discover and connect with great local businesses including restaurants, hotels, shops, and more.

## 🚀 Features

### Core Features
- **Advanced Search & Filters**: Search by keyword, category, price range, and distance
- **Interactive Map Integration**: Ready for Leaflet/Mapbox integration
- **Responsive Design**: Mobile-first, pixel-perfect UI with RTL support
- **Category Browsing**: Browse listings by 8+ categories
- **Listing Detail Pages**: Comprehensive information including hours, amenities, contact details
- **Rating & Reviews**: Display ratings and review counts
- **Contact Form**: Built with react-hook-form and validation

### Authentication & Authorization
- **User Authentication**: Email/password authentication with Lovable Cloud
- **Role-Based Access Control**: Three user roles (user, owner, admin)
- **Avatar Menu**: Clickable user avatar with dropdown showing profile, role badge, and navigation
- **Persistent Sign Out**: Dedicated sign-out button in navbar for quick access
- **Protected Routes**: Secure access to owner and admin features with role-based redirects
- **Auto-confirm Email**: Streamlined signup process for testing

### Owner Features
- **Listing Management**: Create, edit, and delete business listings
- **Owner Dashboard**: View and manage all your listings at `/owner/my-listings`
- **Rich Listing Forms**: Comprehensive forms with validation

### User Features
- **Profile Page**: Personal dashboard with favorites and visited history
- **Favorites Management**: Save and organize favorite listings
- **History Tracking**: View recently visited places with timestamps
- **Quick Actions**: Unfavorite, view details, and remove from history

### Multilingual Support
- **English & Arabic**: Full i18n support with Arabic as default language
- **RTL Layout**: Automatic right-to-left layout for Arabic with mirrored navigation
- **Language Switcher**: Globe icon in navbar to toggle between languages
- **Language Persistence**: Language preference saved in localStorage
- **No FOUC**: Direction set early to prevent flash of incorrect direction

### Theme Support
- **Light/Dark Mode**: Toggle between themes
- **Theme Persistence**: Theme preference saved in localStorage
- **Semantic Design Tokens**: Consistent theming across components

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for filters
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: react-hook-form + zod validation
- **Routing**: React Router v6
- **Icons**: lucide-react
- **Maps**: Leaflet (react-leaflet)
- **Animations**: Framer Motion
- **i18n**: react-i18next
- **Theme**: next-themes

### Backend (Lovable Cloud)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Row-Level Security**: Protected database access
- **Real-time**: Supabase Realtime capabilities

## 📦 Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd wheretogo

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔧 Configuration

### Environment Variables

Environment variables are automatically configured through Lovable Cloud:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Authentication Setup

The app uses Lovable Cloud authentication with the following configuration:
- **Auto-confirm Email**: Enabled for easier testing
- **Email Provider**: Configured for email/password auth
- **Redirect URL**: Set to app origin

### User Roles

Three roles are available with role-based dashboard routing:
1. **user**: Default role for all new signups
   - Dashboard → `/profile` (Favorites and History tabs)
   - Can save favorites and track visited listings
2. **owner**: Can create and manage listings (must be assigned manually)
   - Dashboard → `/owner/my-listings`
   - Full CRUD on own listings only
3. **admin**: Full access to all features (must be assigned manually)
   - Dashboard → `/dashboard`
   - Full CRUD on Users, Listings, and Categories

**Security Note**: Roles are stored in a separate `user_roles` table with proper RLS policies to prevent privilege escalation attacks.

To assign roles, insert into `user_roles` table via backend interface.

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Navigation with avatar menu
│   │   └── Footer.tsx              # Footer component
│   ├── ui/                         # shadcn/ui components
│   ├── UserAvatar.tsx              # Avatar dropdown with profile
│   ├── SignOutButton.tsx           # Standalone sign-out button
│   ├── CategoryCard.tsx            # Category display card
│   ├── ListingCard.tsx             # Listing display card
│   ├── SearchFilters.tsx           # Filter panel component
│   ├── ProtectedRoute.tsx          # Route protection HOC
│   ├── ThemeProvider.tsx           # Theme context provider
│   ├── ThemeToggle.tsx             # Dark/light mode toggle
│   └── LanguageSwitcher.tsx        # Language switcher
├── contexts/
│   └── AuthContext.tsx             # Authentication context with roles
├── pages/
│   ├── Home.tsx                    # Landing page
│   ├── Listings.tsx                # Listings with filters
│   ├── ListingDetail.tsx           # Listing details
│   ├── Contact.tsx                 # Contact form
│   ├── Profile.tsx                 # User profile with favorites/history
│   ├── Favorites.tsx               # Favorites management
│   ├── Dashboard.tsx               # Admin dashboard (admin only)
│   ├── NotFound.tsx                # 404 page
│   ├── auth/
│   │   ├── SignIn.tsx              # Sign in page
│   │   ├── SignUp.tsx              # Sign up page
│   │   └── ForgotPassword.tsx      # Password reset
│   └── owner/
│       ├── MyListings.tsx          # Owner's listings dashboard
│       └── AddListing.tsx          # Create listing
├── integrations/
│   └── supabase/
│       ├── client.ts               # Supabase client
│       └── types.ts                # Generated types
├── lib/
│   ├── i18n.ts                     # i18n configuration
│   └── utils.ts                    # Utility functions
├── store/
│   └── useFilterStore.ts           # Filter state
├── types/
│   └── listing.ts                  # TypeScript interfaces
├── utils/
│   └── distance.ts                 # Distance calculations
├── App.tsx                         # Main app with routes
└── index.css                       # Design system
```

## 🎨 Design System

The application uses a comprehensive design system defined in `src/index.css`:

- **Primary Color**: Coral Red (#EF4444)
- **Accent Color**: Orange (#F97316)
- **Success**: Green (#10B981)
- **Typography**: Clean, modern sans-serif
- **Components**: All using semantic tokens from the design system

## 🗺️ Map Integration

The app is ready for map integration. To enable maps:

1. **Using Mapbox**:
   - Sign up at [mapbox.com](https://mapbox.com)
   - Get your public access token
   - Add token to `.env` as `VITE_MAPBOX_TOKEN`
   - Uncomment map component in `src/pages/Listings.tsx`

2. **Using Leaflet (OpenStreetMap)**:
   - Already installed via react-leaflet
   - Import CSS: `import 'leaflet/dist/leaflet.css'`
   - Use the MapContainer component from react-leaflet

## 🔌 Backend (Lovable Cloud)

The app uses Lovable Cloud for full backend functionality:

### Database Tables
- **profiles**: User profile information
- **user_roles**: Role assignments (user, owner, admin)
- **categories**: Listing categories
- **listings**: Business listings with full details
- **favorites**: User favorite listings

### Authentication
- Email/password authentication
- Session management
- Auto-confirm email for testing
- Protected routes with role checks

### Security
- Row-Level Security (RLS) policies on all tables
- Role-based access control
- Secure authentication flows
- Protected API endpoints

### Accessing Backend
To view and manage your backend data, use the Lovable Cloud interface in the project settings.

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🧪 Testing

To add tests:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Example test locations:
- `src/utils/distance.test.ts` - Distance calculation tests
- `src/components/ListingCard.test.tsx` - Component tests

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🎯 Future Enhancements

- [ ] Real-time map with markers and clustering
- [ ] Reviews and ratings system (user-generated)
- [ ] Booking/reservation system
- [ ] Image upload for listings (file storage)
- [ ] Advanced search with geolocation
- [ ] Email notifications
- [ ] Social sharing integration
- [ ] Analytics dashboard for owners
- [ ] Payment integration (Stripe)
- [ ] Admin panel for category management
- [ ] Listing approval workflow
- [ ] Enhanced favorites with collections

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email hello@wheretogo.com or open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
