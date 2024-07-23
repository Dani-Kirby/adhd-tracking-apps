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
//            EventDayList()
//                .tabItem {
//                    Label("Day Data", systemImage: "chart.bar.doc.horizontal.fill")
//                }
//            BloodPressureList()
//                .tabItem {
//                    Label("Blood Pressure", systemImage: "heart.fill")
//                }
            SleepList()
                .tabItem {
                    Label("Sleep Data", systemImage: "bed.double.fill")
                }
//            ScreenTimeList()
//                .tabItem {
//                    Label("Screen Time", systemImage: "iphone.gen1")
//                }
//            MedicationList()
//                .tabItem { Label("Medications", systemImage: "pill")
//                }
        }
    }
    
}

#Preview {
    ContentView()
        .modelContainer(SampleData.shared.modelContainer)
}
