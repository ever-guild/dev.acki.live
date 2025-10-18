# ACKI.live - Blockchain Explorer

A modern SvelteKit-based blockchain explorer with comprehensive data visualization, multi-language support, and reusable UI components built with Tailwind CSS.

## Features

- 🌐 **Multi-Language Support** - English and Russian with persistent language preference
- 🎨 **Theme Switcher** - Dark (default) and light themes with smooth transitions
- 📊 **Network Statistics** - Key blockchain metrics and data visualization
- 🧩 **Reusable UI Components** - Built with Svelte components and Tailwind CSS
- 📊 **Comprehensive Data Views**:
  - **Blocks** - Recent blocks with height, hash, timestamp, and transaction count
  - **Transactions** - Transaction list with hash, from/to addresses, amount, and status
  - **Messages** - Blockchain messages with sender, recipient, and message type
  - **Contracts** - Smart contracts with address, creation date, and interaction count
  - **Accounts** - Account details and transaction history
  - **Stats** - Network statistics and analytics
  - **Showcase** - Demo features and capabilities
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Modern Tech Stack** - Built with SvelteKit, TypeScript, and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
# or alternatively:
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

## Development

### Sync SvelteKit types

```bash
npx svelte-kit sync
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

The build artifacts will be stored in the `build/` directory.

### Deploy to GitHub Pages

This project includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

#### Setup Steps:

1. **Enable GitHub Pages** in your repository:
   - Go to `Settings` → `Pages`
   - Under "Build and deployment", select `Source: GitHub Actions`

2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. The GitHub Actions workflow will automatically:
   - Build the SvelteKit app with production configuration
   - Deploy to GitHub Pages
   - Make it available at: `https://<username>.github.io/acki.live/`

The deployment runs automatically on every push to the `main` branch, or you can trigger it manually from the Actions tab.

### Running Tests

```bash
npm test
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── Navbar.svelte         # Top navigation component
│   │   └── ui/                   # Reusable UI components
│   ├── services/
│   │   ├── blockchain.ts         # Blockchain data service
│   │   └── search.ts            # Search functionality
│   ├── stores/
│   │   ├── i18n.ts              # Internationalization store
│   │   └── theme.ts             # Theme management store
│   └── utils/
│       └── time.ts              # Time utility functions
├── routes/
│   ├── +layout.svelte           # Root layout
│   ├── +layout.ts               # Layout data loading
│   ├── +page.svelte             # Home page
│   ├── +page.ts                 # Home page data loading
│   ├── accounts/[id]/           # Account detail pages
│   ├── blocks/                  # Blocks listing and detail pages
│   ├── contracts/               # Contracts page
│   ├── messages/                # Messages listing and detail pages
│   ├── showcase/                # Demo showcase page
│   ├── stats/                   # Statistics page
│   └── transactions/            # Transactions listing and detail pages
├── app.css                      # Global styles
├── app.html                     # HTML template
└── hooks.server.ts              # Server-side hooks
```

## Technologies Used

- **SvelteKit** - Full-stack web framework with SSR/SPA capabilities
- **Svelte** - Component framework with reactive programming
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

## Features in Detail

### SvelteKit Features

- **Server-Side Rendering (SSR)** - Fast initial page loads with SEO benefits
- **Static Site Generation (SSG)** - Pre-rendered pages for optimal performance
- **Client-Side Navigation** - Smooth SPA-like navigation after initial load
- **File-based Routing** - Routes defined by file structure in `src/routes/`
- **Reactive Components** - Svelte's reactive programming model

### Reusable UI Components

UI components are built using Svelte's component system with Tailwind CSS:

- **Navbar Component** - Navigation with theme and language switching
- **Card Components** - Reusable containers with consistent styling
- **Data Tables** - Responsive tables for blockchain data display

### Internationalization

- Multi-language support with reactive stores
- Language preference persistence
- Dynamic content switching between English and Russian

### Theme System

- Dark/light theme toggle
- CSS custom properties for consistent theming
- Theme preference persistence in localStorage

### Data Management

- Service layer for blockchain data fetching
- Search functionality across different data types
- Time utilities for blockchain timestamp formatting

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme.

### Translations
Add or modify translations in `src/lib/stores/i18n.ts`.

### Theme
Customize theme variables in `src/app.css`.

### UI Components
All UI components are located in `src/lib/components/` and follow Svelte's component conventions.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## SvelteKit Configuration

This project uses several SvelteKit configuration files:

- `svelte.config.js` - Main SvelteKit configuration
- `vite.config.ts` - Vite build tool configuration
- `tsconfig.json` - TypeScript configuration that extends SvelteKit's generated config
- `.svelte-kit/` - Auto-generated folder with types and build artifacts

### Important Notes

- The `.svelte-kit` folder is auto-generated and should not be committed to version control
- Run `npx svelte-kit sync` to regenerate types after route changes
- TypeScript configuration extends from `.svelte-kit/tsconfig.json` for proper SvelteKit type support

## Architecture Highlights

### File-based Routing
- Routes are defined by the file structure in `src/routes/`
- `+page.svelte` files define page components
- `+layout.svelte` files define layout components
- `+page.ts` and `+layout.ts` files handle data loading

### State Management
- Svelte stores for reactive state management
- LocalStorage integration for persistent user preferences
- Service layer for data fetching and business logic

### Styling Approach
- Tailwind CSS for utility-first styling
- CSS custom properties for theming
- Responsive design with mobile-first approach
- Component-scoped styles in Svelte components

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
