# ADHD Tracker Web App

A React/TypeScript web application for tracking ADHD-related activities and metrics.

## Features

- Track sleep patterns, screen time, medications, to-dos, and calendar events
- Customizable dashboard views
- Multiple medication doses with scheduled and as-needed tracking
- Custom tagging system with color-coding
- Global and per-view tag filtering
- Hours and minutes input for screen time tracking
- Notes field for todo items
- Drag-and-drop card reordering
- Multi-user support with Google authentication
- Guest mode with data migration capability

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the web app directory:
   ```bash
   cd adhd-tracking-apps/web
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Environment Configuration

1. Create a `.env` file in the web directory:
   ```bash
   cp .env.example .env
   ```

2. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Google Authentication:
     1. Go to Authentication > Sign-in method
     2. Enable Google sign-in
     3. Add your domain to authorized domains
   - Get your Firebase configuration:
     1. Go to Project Settings > General
     2. Scroll to "Your apps" section
     3. Create a web app or select existing one
     4. Copy the configuration values
   - Update your `.env` file with the Firebase configuration values

### Running the Application

1. Start the development server:
   ```bash
   npm start
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

## Development Guidelines

### Project Structure

```
src/
  ├── components/
  │   ├── common/       # Shared components
  │   └── views/        # Main view components
  ├── contexts/         # React Context providers
  ├── firebase/         # Firebase configuration
  ├── types/           # TypeScript type definitions
  └── utils/           # Utility functions
```

### Adding New Features

1. Define types in `src/types/index.ts`
2. Create new components in appropriate directories
3. Update context providers if needed
4. Add tests for new functionality

### Code Style

- Use TypeScript for type safety
- Follow React hooks guidelines
- Maintain consistent component structure
- Use Material-UI components for UI consistency

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## Security

- Never commit `.env` files
- Keep Firebase credentials secure
- Use environment variables for sensitive data
- Follow security best practices for authentication

## License

MIT License - see LICENSE file for details