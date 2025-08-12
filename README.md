# ADHD Tracking Applications

This repository contains two implementations of the ADHD Tracking application:
- Web application (React/TypeScript)
- iOS application (Swift/SwiftUI)

## Security

This project takes security seriously. We follow industry best practices to protect user data and ensure safe operation:

- Data encryption at rest
- Secure authentication
- Input validation
- Rate limiting
- Regular security updates

For more details, see our [Security Policy](SECURITY.md).

### Security Best Practices

When contributing or deploying:
1. Never commit sensitive credentials
2. Use environment variables for configuration
3. Keep dependencies updated
4. Follow secure coding guidelines

### Reporting Security Issues

Please do not report security vulnerabilities through public GitHub issues. Instead:

1. See our [Security Policy](SECURITY.md) for reporting instructions
2. Allow time for us to respond and address the issue
3. Do not disclose the issue publicly until it has been addressed

## Applications

This repository contains two implementations of an ADHD tracking application:

1. [Web Application](./web/README.md) - A React/TypeScript implementation
2. [iOS Application](./ios/README.md) - A native Swift/SwiftUI implementation

Both applications provide the same core functionality while taking advantage of their respective platforms' capabilities.

## Core Features

- Track sleep patterns, screen time, medication, to-dos, and calendar events
- Customizable dashboard views
- Multiple medication doses (scheduled and as-needed)
- Custom tagging system with color-coding
- Global and per-view tag filtering
- Hours and minutes input for screen time tracking
- Notes field for todo items
- Drag-and-drop card reordering

## Platform-Specific Features

### Web Application
- Multi-user support with Google authentication
- Guest mode with data migration capability
- Firebase integration for authentication
- Local storage for data persistence
- Responsive design for all screen sizes

### iOS Application
- Native iOS UI components
- SwiftUI animations and transitions
- UserDefaults for data persistence
- Native drag-and-drop implementation
- iOS-specific design patterns

## Getting Started

### Web Application
See the [web application README](./web/README.md) for:
- Setup instructions
- Environment configuration
- Development guidelines
- Testing instructions

### iOS Application
See the [iOS application README](./ios/README.md) for:
- XcodeGen setup
- Build instructions
- Development guidelines
- Testing procedures

## Security Notes

- Web app credentials should be stored in `.env` files (not committed to version control)
- Follow the security guidelines in each app's README
- Keep Firebase configuration secure
- Follow platform-specific security best practices

## Directory Structure

```
adhd-tracking-apps/
├── web/                 # React/TypeScript web application
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   └── README.md       # Web app documentation
│
└── ios/                # Swift/SwiftUI iOS application
    ├── ADHDTracker/    # Source code
    ├── project.yml     # XcodeGen configuration
    └── README.md       # iOS app documentation
```

## License

Both applications are released under the MIT License. See the LICENSE file in each application directory for details.