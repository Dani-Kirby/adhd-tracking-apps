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
//    @Query private var screenTimes: [ScreenTime]
    @Query private var eventDays: [EventDay]
    @State private var newDay : EventDay?
    
    var body: some View {
        NavigationSplitView {
            Group {
                if !eventDays.isEmpty {
                    List {
                        ForEach(eventDays) { 
                        day in
                            NavigationLink {
                                ScreenTimeDetail(eventDay: day)
                                    .navigationTitle("Screen Time")
                            } label: {
                                HStack {
                                    Text("\(day.calendarDate.formatted(date: .complete, time: .omitted))")
                                    Spacer()
                                    Text("\(day.screenTime.hours)h \(day.screenTime.minutes)m")
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
            .sheet(item: $newDay) { day in
                NavigationStack {
                    ScreenTimeDetail(eventDay: day, isNew: true)
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
                let newItem = EventDay(calendarDate: Date.now, sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: false))
                modelContext.insert(newItem)
                newDay = newItem
            }
        }
        
        private func deleteScreenTime(offsets: IndexSet) {
            withAnimation {
                for index in offsets {
                    modelContext.delete(eventDays[index].screenTime)
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
