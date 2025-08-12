# ADHD Tracker iOS App

A native iOS application built with Swift and SwiftUI for tracking ADHD-related activities and metrics.

## Features

- Track sleep patterns, screen time, medications, to-dos, and calendar events
- Customizable dashboard views
- Multiple medication doses with scheduled and as-needed tracking
- Custom tagging system with color-coding
- Global and per-view tag filtering
- Hours and minutes input for screen time tracking
- Notes field for todo items
- Drag-and-drop card reordering
- Local data persistence with UserDefaults

## Setup Instructions

### Prerequisites

- Xcode 14.0 or later
- iOS 15.0+ deployment target
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) for project generation

### Installation

1. Install XcodeGen if you haven't already:
   ```bash
   brew install xcodegen
   ```

2. Clone the repository and navigate to the iOS app directory:
   ```bash
   cd adhd-tracking-apps/ios
   ```

3. Generate the Xcode project:
   ```bash
   xcodegen generate
   ```

4. Open the generated project:
   ```bash
   open ADHDTracker.xcodeproj
   ```

### Building and Running

1. Select your target device/simulator in Xcode
2. Press ⌘R to build and run the app

## Configuration Management

### Environment Configuration
The iOS app supports multiple ways to handle configuration and sensitive data:

1. **XcConfig Files** (Recommended)
   ```
   Config.xcconfig.example         # Template configuration file
   Config.debug.xcconfig           # Debug environment settings
   Config.release.xcconfig         # Release environment settings
   ```
   - Copy `.xcconfig.example` to create your configurations
   - Add actual configuration files to .gitignore
   - Reference values in Info.plist using $(VARIABLE_NAME)

2. **Configuration.plist**
   - Create Configuration.plist.example
   - Store sensitive values in Configuration.plist
   - Add Configuration.plist to .gitignore
   - Access values through Bundle.main.path(forResource:)

3. **Build Settings in project.yml**
   ```yaml
   settings:
     base:
       PRODUCT_BUNDLE_IDENTIFIER: com.example.adhdtracker
     configs:
       debug:
         API_BASE_URL: $(API_BASE_URL)
       release:
         API_BASE_URL: $(API_BASE_URL)
   ```

### Setting Up Configuration

1. Create your configuration file:
   ```bash
   cp Config.xcconfig.example Config.debug.xcconfig
   cp Config.xcconfig.example Config.release.xcconfig
   ```

2. Update configuration values in your xcconfig files
3. Never commit actual configuration files to version control
4. Use different configurations for different environments

### Accessing Configuration Values

```swift
// Using Info.plist values (populated from xcconfig)
if let apiKey = Bundle.main.object(forInfoDictionaryKey: "API_KEY") as? String {
    // Use apiKey
}

// Using Configuration.plist
if let path = Bundle.main.path(forResource: "Configuration", ofType: "plist"),
   let config = NSDictionary(contentsOfFile: path) {
    let apiKey = config["API_KEY"] as? String
}
```

## Project Structure

```
ADHDTracker/
  ├── Models/          # Data models and types
  ├── Views/           # SwiftUI views
  │   ├── Common/      # Reusable view components
  │   └── Trackers/    # Individual tracker views
  ├── DataStore/       # Data persistence layer
  ├── Utils/          # Utility functions and extensions
  └── Resources/      # Assets and configuration files
```

## Development Guidelines

### Architecture

- Follow MVVM architecture pattern
- Use SwiftUI for views
- Implement proper data flow with Combine
- Keep views modular and reusable

### Code Style

- Follow Swift API Design Guidelines
- Use SwiftLint for code style consistency
- Write clear documentation comments
- Keep functions small and focused

### Adding New Features

1. Update Models.swift if needed
2. Create new views in appropriate directories
3. Update DataStore.swift for persistence
4. Add unit tests for new functionality

## Testing

### Running Tests

1. In Xcode, press ⌘U to run all tests
2. Use the Test Navigator to run specific tests
3. Enable code coverage in the scheme editor

### Writing Tests

- Place tests in the appropriate test target
- Follow AAA pattern (Arrange, Act, Assert)
- Mock dependencies when necessary
- Test edge cases and error conditions

## Data Models

### Core Types

```swift
struct TodoItem: Identifiable, Codable {
    var id: UUID
    var title: String
    var completed: Bool
    var dueDate: Date?
    var notes: String?
    var tags: [Tag]
}

struct MedicationDose: Identifiable, Codable {
    var id: UUID
    var scheduledTime: Date
    var takenTime: Date?
    var notes: String?
}
```

## State Management

- Uses `@StateObject` for view model data
- Implements `ObservableObject` for data stores
- Manages user defaults synchronization
- Handles state persistence automatically

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Clean build folder (⇧⌘K)
   - Clean build cache
   - Regenerate project with XcodeGen

2. **Runtime Issues**
   - Check Debug Navigator
   - Review Console output
   - Verify data persistence

## Contributing

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details