# Vinyl App

A Next.js application for creating custom vinyl records with personalized covers and stickers.

## Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- Firebase account with Firestore and Storage enabled

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vinyl-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env.local` file in the root directory with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Firebase (Firestore & Storage)
- Zustand (State Management)

## Project Structure

- `/app` - Next.js app router pages
- `/components` - React components
- `/lib` - Utilities and services
- `/public` - Static assets (images, fonts, stickers)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
