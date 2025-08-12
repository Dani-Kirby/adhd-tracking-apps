import SwiftUI

@main
struct ADHDTrackerApp: App {
    // Create a shared data store as an environment object
    @StateObject private var dataStore = DataStore()
    
    var body: some Scene {
        WindowGroup {
            // Set up main navigation with TabView
            ContentView()
                .environmentObject(dataStore)
        }
    }
}

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Dashboard tab
            NavigationView {
                DashboardView()
                    .navigationTitle("ADHD Tracker")
                    .navigationBarItems(trailing: AddButton())
            }
            .tabItem {
                Label("Dashboard", systemImage: "square.grid.2x2")
            }
            .tag(0)
            
            // Tags management tab
            NavigationView {
                TagsView()
                    .navigationTitle("Tags")
            }
            .tabItem {
                Label("Tags", systemImage: "tag")
            }
            .tag(1)
            
            // Settings tab
            NavigationView {
                SettingsView()
                    .navigationTitle("Settings")
            }
            .tabItem {
                Label("Settings", systemImage: "gear")
            }
            .tag(2)
        }
    }
}

// A reusable add button component
struct AddButton: View {
    @State private var showingAddMenu = false
    
    var body: some View {
        Button(action: {
            showingAddMenu = true
        }) {
            Image(systemName: "plus")
                .font(.title2)
        }
        .actionSheet(isPresented: $showingAddMenu) {
            ActionSheet(
                title: Text("Add Item"),
                buttons: [
                    .default(Text("Sleep Entry")) { /* Navigate to sleep form */ },
                    .default(Text("Screen Time")) { /* Navigate to screen time form */ },
                    .default(Text("Medication")) { /* Navigate to medication form */ },
                    .default(Text("To-Do Item")) { /* Navigate to todo form */ },
                    .default(Text("Calendar Event")) { /* Navigate to calendar form */ },
                    .cancel()
                ]
            )
        }
    }
}

// Placeholder views
struct TagsView: View {
    @EnvironmentObject var dataStore: DataStore
    
    var body: some View {
        List {
            ForEach(dataStore.tags) { tag in
                HStack {
                    Circle()
                        .fill(Color(hex: tag.color))
                        .frame(width: 20, height: 20)
                    Text(tag.name)
                }
            }
            .onDelete { indexSet in
                indexSet.forEach { index in
                    dataStore.deleteTag(id: dataStore.tags[index].id)
                }
            }
            
            Button(action: {
                // Show add tag dialog
            }) {
                Label("Add Tag", systemImage: "plus")
            }
        }
    }
}

struct SettingsView: View {
    var body: some View {
        List {
            Section(header: Text("Display")) {
                Toggle("Dark Mode", isOn: .constant(false))
                Toggle("Show Completed Items", isOn: .constant(true))
            }
            
            Section(header: Text("Notifications")) {
                Toggle("Medication Reminders", isOn: .constant(true))
                Toggle("To-Do Reminders", isOn: .constant(true))
            }
            
            Section(header: Text("Data")) {
                Button("Export Data") {
                    // Export functionality
                }
                Button("Import Data") {
                    // Import functionality
                }
            }
        }
        .listStyle(InsetGroupedListStyle())
    }
}

// Extension to create Color from hex string
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}