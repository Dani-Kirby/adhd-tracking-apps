//
//  ScreenTimeList.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import SwiftUI
import SwiftData

struct ScreenTimeList: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var screenTimes: [ScreenTime]
    @State private var newScreenTime : ScreenTime?
    
    var body: some View {
        NavigationSplitView {
            Group {
                if !screenTimes.isEmpty {
                    List {
                        ForEach(screenTimes) {
                        screenTime in
                            NavigationLink {
                                ScreenTimeDetail(screenTime: screenTime)
                                    .navigationTitle("Screen Time")
                            } label: {
                                HStack {
                                    Text("\(screenTime.calendarDate.formatted(date: .complete, time: .omitted))")
                                    Spacer()
                                    Text("\(screenTime.hours)h \(screenTime.minutes)m")
                                }

                            }
                        }
                        .onDelete(perform: deleteScreenTime)
                    }
                } else {
                    ContentUnavailableView("No Screen Time Data", systemImage: "iphone.gen1.slash")
                }
            }
            .navigationTitle("Screen Time")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
                ToolbarItem {
                    Button(action: addScreenTime) {
                        Label("Add Screen Time", systemImage: "plus")
                    }
                }
            }
            .sheet(item: $newScreenTime) { screenTime in
                NavigationStack {
                    ScreenTimeDetail(screenTime: screenTime, isNew: true)
                }
                .interactiveDismissDisabled()
            }
        } detail: {
            Text("Select an item")
                .navigationTitle("Screen Time")
            }
            
        }
        
        private func addScreenTime() {
            withAnimation {
                let newItem = ScreenTime(hours: 0, minutes: 0, date: Date.now)
                modelContext.insert(newItem)
                newScreenTime = newItem
            }
        }
        
        private func deleteScreenTime(offsets: IndexSet) {
            withAnimation {
                for index in offsets {
                    modelContext.delete(screenTimes[index])
                }
            }
    
    }
}

#Preview {
    ScreenTimeList()
        .modelContainer(SampleData.shared.modelContainer)
}

#Preview("Empty List") {
    ScreenTimeList()
        .modelContainer(for: EventDay.self, inMemory: true)
}
