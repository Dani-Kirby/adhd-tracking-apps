//
//  ADHD_TrackerApp.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import SwiftUI
import SwiftData

@main
struct ADHD_TrackerApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            BloodPressure.self,
            Sleep.self,
            ScreenTime.self,
            EventDay.self,
            Medication.self
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(sharedModelContainer)
    }
}
