# Movie Vault

**Movie Vault** is a high-performance, open-source streaming aggregator designed for the modern web. It provides a seamless, ad-free interface for discovering and watching movies and TV shows with 9 active high-speed streaming clusters and multilingual audio support (Telugu, Hindi, English).

## 🚀 Key Features

- 🍿 **Curated Aggregation**: 9 verified streaming servers with instant fallback and keyboard shortcuts (1-9, N for Next Server).
- 🔊 **Audio Language Toggle**: Instant selection between Auto/Original, Telugu, Hindi, and English audio tracks.
- 📺 **Comprehensive Content Discovery**: Explore trending titles, genres, and personalized recommendations powered by the TMDb API.
- 🔍 **Smart Search**: High-speed search with real-time previews and pagination.
- 🎨 **Cinema Mode Player**: Borderless, sleek cinema player with floating controls and zero popups.
- ⚡ **Performance First**: Built with Next.js 15 App Router, React 19, and Bun for ultra-fast rendering.
- 🛡️ **Zero Login Friction**: Instant access without sign-up or accounts required.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) & React 19
- **Runtime**: Bun
- **Styling**: Tailwind CSS & Shadcn UI
- **Icons**: Lucide React
- **API**: TMDB API

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Astrionix/Movie-vault.git
cd Movie-vault
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables in `.env.local`:
```env
TMDB_API_KEY=your_tmdb_api_key
```

4. Run the development server:
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.