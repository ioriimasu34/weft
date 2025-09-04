# RFID Platform Mobile

A Progressive Web App (PWA) for RFID tracking and monitoring on mobile devices.

## Features

- 📱 **Progressive Web App** - Works on any device with a browser
- 🔐 **Authentication** - Supabase Auth integration
- 📡 **RFID Simulation** - Simulate RFID reads for testing
- 📊 **Real-time Dashboard** - Live RFID tracking interface
- 🔄 **Offline Support** - Works without internet connection
- 📱 **Mobile Optimized** - Touch-friendly interface
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run typecheck` - Run type checking

## PWA Features

- **Installable** - Can be installed like a native app
- **Offline Support** - Works without internet connection
- **Push Notifications** - Get notified about new RFID reads
- **Background Sync** - Sync data when connection is restored

## RFID Simulation

The app includes RFID simulation for testing:
- Simulate individual reads
- Continuous scanning mode
- Real-time feed display
- Statistics and analytics

## Deployment

Deploy to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

Built with:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Supabase
- PWA Plugin
