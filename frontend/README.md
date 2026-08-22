# EduAssess — About Page
**Web-Based Mandatory Access Control (MAC) Reviewer System**  
College of Teacher Education · PRMSU IBA

---

## Folder Structure

```
eduassess/
├── index.html                        # Root HTML template (Vite entry)
├── package.json                      # Dependencies & scripts
├── vite.config.js                    # Vite + React plugin config
│
└── src/
    ├── main.jsx                      # React DOM entry point
    ├── App.jsx                       # Root component — assembles all sections
    │
    ├── components/
    │   ├── Navbar.jsx                # Fixed navigation bar
    │   ├── Hero.jsx                  # Split-panel hero section
    │   ├── MissionVision.jsx         # Mission & Vision cards
    │   ├── InstitutionSection.jsx    # Institutional background + stat card
    │   ├── MacSection.jsx            # MAC framework 6-card grid
    │   ├── PlatformSection.jsx       # Platform features + visual panel
    │   ├── CTESection.jsx            # CTE values banner
    │   ├── CTASection.jsx            # Register call-to-action
    │   └── Footer.jsx                # Site footer
    │
    └── styles/
        ├── globals.css               # CSS variables, resets, shared utilities
        ├── Navbar.css                # Navbar styles
        ├── Hero.css                  # Hero section styles
        ├── MissionVision.css         # Mission & Vision styles
        ├── InstitutionSection.css    # Institution section styles
        ├── MacSection.css            # MAC section styles
        ├── PlatformSection.css       # Platform section styles
        ├── CTESection.css            # CTE section styles
        └── CTASection.css            # CTA section + Footer styles
```

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Navigate into the project folder
cd eduassess

# 2. Install dependencies
npm install
# Core Navigation & State Management
npm install react-router-dom zustand axios

# UI & Styling
npm install lucide-react    # Para sa mga icons (Mail, Key,)
npm install framer-motion   # Para sa mga smooth animations/transitions

# Core Web Framework
pip install django djangorestframework django-cors-headers

# AI  (Alternative to dlib)
pip install mediapipe opencv-python numpy

# Database & Utilities
pip install psycopg2  # Para sa PostgreSQL/pgAdmin
pip install pillow    # Para sa paghandle ng images
pip install python-dotenv # Para sa pagtatago ng API keys/Email passwords

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Component Overview

| Component | Description |
|---|---|
| `Navbar` | Fixed top nav with anchor links and Register CTA |
| `Hero` | Two-panel hero — dark navy left, warm sand right |
| `MissionVision` | Side-by-side Mission (dark) and Vision (light) cards |
| `InstitutionSection` | PRMSU IBA background text + stats card + note |
| `MacSection` | Six-card grid explaining the MAC security model |
| `PlatformSection` | Feature list with icon tiles + system overview panel |
| `CTESection` | CTE values inside a dark navy banner |
| `CTASection` | Full-width registration call-to-action |
| `Footer` | Brand, copyright, and utility links |

---

## Design Tokens (CSS Variables)

Defined in `src/styles/globals.css`:

| Variable | Value | Usage |
|---|---|---|
| `--navy` | `#1B2C4E` | Primary brand color |
| `--navy-deep` | `#111C33` | Dark backgrounds |
| `--gold` | `#C89B3C` | Accent color |
| `--gold-light` | `#E8C06A` | Hover / italic highlights |
| `--gold-pale` | `#F5E9CC` | Subtle gold tint |
| `--sand` | `#F8F4EE` | Page background |
| `--white` | `#FFFFFF` | Card backgrounds |
| `--muted` | `#6B6B6B` | Body text |
| `--rule` | `#D6CFC4` | Borders and dividers |

---

## Tech Stack

- **React 18** — UI component library
- **Vite 5** — Development server and bundler
- **Plain CSS Modules** — Per-component scoped stylesheets
- **Google Fonts** — Cormorant Garamond + DM Sans

---

*EduAssess is an internal academic platform for PRMSU IBA College of Teacher Education.*