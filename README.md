# ACKI.live - Blockchain Explorer

A modern Angular-based blockchain explorer with comprehensive data visualization, multi-language support, and reusable UI components built with Tailwind CSS.

## Features

- 🌐 **Multi-Language Support** - English and Russian with persistent language preference
- 🎨 **Theme Switcher** - Dark (default) and light themes with smooth transitions
- 📊 **Collapsible Network Statistics** - Key metrics displayed at the top of every page with collapsible view (preference saved in localStorage)
- 🧩 **Reusable UI Components** - Built with Tailwind `@apply` directive for clean, maintainable code
- 📊 **Comprehensive Data Views**:
  - **Blocks** - Recent blocks with height, hash, timestamp, and transaction count
  - **Transactions** - Transaction list with hash, from/to addresses, amount, and status
  - **Messages** - Blockchain messages with sender, recipient, and message type
  - **Contracts** - Smart contracts with address, creation date, and interaction count
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Modern Tech Stack** - Built with Angular 17 and Tailwind CSS

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
```

3. Open your browser and navigate to:
```
http://localhost:4200
```

## Development

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

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
   - Build the Angular app with production configuration
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
├── app/
│   ├── components/
│   │   ├── navbar/              # Top navigation component
│   │   ├── network-stats/       # Collapsible network statistics
│   │   └── ui/
│   │       ├── card/            # Reusable card component
│   │       ├── badge/           # Badge component with variants
│   │       ├── stat-card/       # Statistics card component
│   │       └── data-table/      # Data table component
│   ├── pages/
│   │   ├── blocks/              # Blocks page
│   │   ├── transactions/        # Transactions page
│   │   ├── messages/            # Messages page
│   │   └── contracts/           # Contracts page
│   ├── services/
│   │   ├── blockchain.service.ts  # Mock blockchain data
│   │   ├── i18n.service.ts        # Internationalization
│   │   └── theme.service.ts       # Theme management
│   ├── app.component.ts
│   └── app.routes.ts
├── styles.scss                  # Global styles with CSS variables
└── index.html
```

## Technologies Used

- **Angular 17** - Modern web framework with standalone components
- **Tailwind CSS** - Utility-first CSS framework with `@apply` directive
- **RxJS** - Reactive programming library
- **TypeScript** - Type-safe JavaScript

## Features in Detail

### Reusable UI Components

All UI components are built using Tailwind's `@apply` directive for better maintainability:

- **CardComponent** - Container with optional hover effects
- **BadgeComponent** - Color-coded badges with variants (success, pending, failed, info, warning, primary, secondary)
- **StatCardComponent** - Statistics display with icon, label, and value
- **DataTableComponent** - Responsive data table with custom scrollbars

### Network Statistics

- Displayed at the top of every page
- Collapsible view with smooth animations
- Preference saved in localStorage
- Shows 8 key metrics: total blocks, transactions, hashrate, active addresses, avg block time, difficulty, market cap, and price

### Navigation
- Top navigation menu with easy access to all sections
- Active route highlighting
- Language switcher (EN/RU)
- Theme toggle (dark/light)

### Dark Theme

The dark theme uses a darker color palette for better contrast:
- Primary background: `rgba(15, 19, 26, 1)`
- Secondary background: `rgba(20, 24, 32, 1)`
- Tertiary background: `rgba(30, 35, 45, 1)`

### Data Tables
- Responsive layout with horizontal scrolling on mobile
- Hover effects for better UX
- Color-coded status indicators using badge components
- Custom scrollbar styling

### Mock Data
Currently using mock data for demonstration. To integrate with a real blockchain:
1. Update `BlockchainService` to connect to your blockchain API
2. Replace mock data methods with actual API calls
3. Add proper error handling and loading states

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme.

### Translations
Add or modify translations in `src/app/services/i18n.service.ts`.

### Theme
Customize theme variables in `src/styles.scss`.

### UI Components
All UI components are located in `src/app/components/ui/` and use `@apply` directives for easy customization.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Architecture Highlights

### Component-Based Design
- Standalone components for better tree-shaking
- Reusable UI components with consistent styling
- Separation of concerns between presentation and data

### State Management
- LocalStorage for persistent user preferences (theme, language, stats collapse state)
- RxJS for reactive data flow
- Service-based architecture for data management

### Styling Approach
- Tailwind CSS with `@apply` directive for component styles
- CSS custom properties for theming
- Responsive design with mobile-first approach

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
