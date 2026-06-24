# TUPT Thesis Archive - Web Application

The official web platform for the Technological University of the Philippines Taguig Thesis Archive. A centralized digital repository designed to preserve, manage, and explore years of institutional research excellence.

**Live Site:** [https://tupt-thesis-archive.vercel.app](https://tupt-thesis-archive.vercel.app)
**Repository:** [https://github.com/gericandmorty/TUPT-Thesis_ArchiveWeb](https://github.com/gericandmorty/TUPT-Thesis_ArchiveWeb)

---

## Features

- **Advanced Search Interface**: Semantic search with real-time suggestions, view/download counters, and database-driven access control limits.
- **Dynamic PDF Abstract Generation**: A print-to-PDF formatting engine for downloading thesis abstracts in a standardized paper format, including institutional TUP headers, faded background gear watermark, and a diagonal distribution warning watermark.
- **Document Analyzer**: Integrated support for analyzing PDF and DOCX documents to extract title suggestions, keywords, and summarize abstracts using AI.
- **Interactive Dashboard**: Visualized research analytics showing trends in departments and academic years, with courses grouped by parent colleges.
- **Premium UI Design**: Built with Tailwind CSS and Framer Motion for a modern, responsive, and institutional experience.
- **Secure Research Portal**: User authentication for students and faculty to manage their own research submissions and tracking.
- **Admin Management**: Dedicated controls for institutional oversight, user management, and archive approval queues.
- **Responsive Layout**: Fully optimized for Desktop, Tablet, and Mobile browsers.

---

## Previews

### Institutional Dashboard
![Home Screen](readme-assets/home.png)

### Research Insights and AI Log
![Analytics Screen](readme-assets/home1.png)

---

## Technical Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: React Icons (Ionicons, Fa, etc.)
- **Notifications**: React Toastify

---

## Prerequisites

- **Node.js**: v18.x or later recommended.
- **Backend API**: The TUPT-Thesis Backend must be running for data fetching.

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/gericandmorty/TUPT-Thesis_ArchiveWeb.git
cd web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the `web` directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 4. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

---

## Project Structure

- `app/`: Next.js App Router pages, styles, layouts, and search page features (including download handling and PDF print formatting).
- `components/`: Reusable UI components (Navigation, Tables, Charts).
- `lib/`: Utility functions and helper classes.
- `public/`: Static assets (Logos, SVGs, Fonts, Assets).

---

## Institutional Note

This platform is developed specifically for TUP Taguig to modernize the academic research archiving process. All rights reserved by the institutional contributors.
