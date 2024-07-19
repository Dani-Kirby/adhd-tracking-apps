//
//  ContentView.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        TabView {
            BloodPressureList()
                .tabItem {
                    Label("Blood Pressure", systemImage: "heart.fill")
                }
            SleepList()
                .tabItem {
                    Label("Sleep Data", systemImage: "bed.double.fill")
                }
            ScreenTimeList()
                .tabItem {
                    Label("Screen Time", systemImage: "iphone.gen1")
                }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(SampleData.shared.modelContainer)
}
