# FIFA Collections Helper - Specification

## Project Overview

- **Project Name**: FIFA Collections Helper
- **Type**: Web Application (Next.js)
- **Core Functionality**: Scan and store FIFA World Cup stickers using phone camera, track duplicates
- **Target Users**: Collectors who want to digitize their sticker collections

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Camera/OCR**: html5-qrcode for camera, Tesseract.js for OCR
- **Deployment**: Vercel

## UI/UX Specification

### Layout Structure

- **Mobile-first design** (primary use case is phone camera)
- **Bottom navigation** with 2 tabs:
  1. Scanner (camera view)
  2. Collection (list of stickers)
- **Responsive**: Works on desktop and mobile

### Visual Design

- **Color Palette**:
  - Primary: `#1E3A5F` (dark blue - FIFA style)
  - Secondary: `#FFD700` (gold - trophy color)
  - Accent: `#FF4444` (red for duplicates/alerts)
  - Background: `#0F172A` (dark slate)
  - Card Background: `#1E293B` (slate-800)
  - Text Primary: `#F8FAFC` (white)
  - Text Secondary: `#94A3B8` (slate-400)
  - Success: `#22C55E` (green)
- **Typography**:
  - Font: Inter (Google Fonts)
  - Headings: Bold, 24px-32px
  - Body: Regular, 14px-16px
  - Code on cards: Monospace, 18px

- **Spacing**: 8px base unit (8, 16, 24, 32, 48)

### Components

#### 1. Scanner Page

- Full-screen camera preview
- Overlay with scanning frame guide
- Real-time OCR processing
- Visual feedback when code is detected (green flash)
- Manual code entry fallback
- Recent scan toast notification

#### 2. Collection Page

- Grid layout (2 columns on mobile, 4 on desktop)
- Each sticker card shows:
  - Team code (e.g., "BRA")
  - Number (e.g., "12")
  - Timestamp
  - Duplicate indicator (red badge if already exists)
- Search/filter functionality
- Stats: total stickers, duplicates count

#### 3. Sticker Card Component

- Rounded corners (12px)
- Team flag placeholder or color based on team
- Code display prominent
- Subtle shadow

### Animations

- Card entrance: fade-in + slide-up
- Scan success: green pulse animation
- Duplicate warning: shake animation

## Database Schema (Supabase)

### Table: stickers

```sql
CREATE TABLE stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,           -- e.g., "BRA"
  number INTEGER NOT NULL,      -- e.g., 12
  full_code TEXT NOT NULL UNIQUE, -- e.g., "BRA12"
  scanned_at TIMESTAMP DEFAULT NOW(),
  is_duplicate BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_full_code ON stickers(full_code);
CREATE INDEX idx_code ON stickers(code);
```

## Functionality Specification

### Core Features

1. **Camera Scanning**
   - Access device camera via getUserMedia
   - Display live preview
   - Capture frame for OCR processing
   - Extract pattern: 2-3 letters + 1-2 digits (e.g., BRA12, ARG10, FRA7)

2. **OCR Processing**
   - Use Tesseract.js for text recognition
   - Regex pattern: `/[A-Z]{2,3}\d{1,2}/`
   - Confidence threshold for valid detection
   - Debounce to prevent multiple scans

3. **Duplicate Detection**
   - Check if full_code exists in database
   - If exists: mark as duplicate, show warning
   - If new: save to database, show success

4. **Collection Management**
   - View all scanned stickers
   - Filter by team code
   - Search functionality
   - Delete individual stickers

### User Flow

1. User opens app → Scanner tab is default
2. Points camera at sticker back
3. App detects code → shows preview
4. User confirms or corrects
5. App saves and shows result (new/duplicate)
6. User can switch to Collection to view all

## File Structure

```
fifa-collections-helper/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── scanner/
│   │   └── page.tsx
│   └── collection/
│       └── page.tsx
├── components/
│   ├── CameraScanner.tsx
│   ├── StickerCard.tsx
│   ├── BottomNav.tsx
│   └── Stats.tsx
├── lib/
│   ├── supabase.ts
│   └── ocr.ts
├── types/
│   └── index.ts
├── public/
│   └── flags/ (optional)
├── supabase/
│   └── schema.sql
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Acceptance Criteria

- [ ] Camera opens and shows live preview on mobile
- [ ] OCR detects codes like BRA12, ARG10, FRA7
- [ ] Stickers are saved to Supabase
- [ ] Duplicate detection works with visual feedback
- [ ] Collection page shows all stickers in grid
- [ ] Responsive design works on mobile and desktop
- [ ] Can be deployed to Vercel
