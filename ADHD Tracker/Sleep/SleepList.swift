//
//  SleepList.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import SwiftUI
import SwiftData

struct SleepList: View {
    @Environment(\.modelContext) private var modelContext
    @Query (sort:\EventDay.calendarDate) private var eventDays: [EventDay]
    @State private var newDay : EventDay?
    
    var body: some View {
        NavigationSplitView {
            Group {
                if !eventDays.isEmpty {
                    List {
//                        for (index, day) in eventDays.enumerated() {
//                            Text(day)
//                            Text(index)
//                        }
                        ForEach(eventDays) {
                            day in
                            NavigationLink {
                                SleepDetail(eventDay: day)
                            } label: {
                                HStack {
                                    Text("\(day.calendarDate.formatted(date: .complete, time: .omitted))")
                                    Spacer()
                                    Text("\(day.sleep.hours)h \(day.sleep.minutes)m")
                                    
                                }

                            }
                        }
                        .onDelete(perform: deleteSleep)
                    }
                } else {
                    ContentUnavailableView("No Sleeps", systemImage: "powersleep")
                }
            }
            .navigationTitle("Sleep")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
                ToolbarItem {
                    Button(action: addSleep) {
                        Label("Add Sleep", systemImage: "plus")
                    }
                }
            }
            .sheet(item: $newDay) { day in
                NavigationStack {
                    SleepDetail(eventDay: day, isNew: true)
                }
                .interactiveDismissDisabled()
            }
        } detail: {
            Text("Select an item")
                .navigationTitle("Sleep")
            }
            
        }
        
        private func addSleep() {
            withAnimation {
                let newItem = EventDay(calendarDate: Date.now, sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: false))
                modelContext.insert(newItem)
                newDay = newItem
            }
        }
        
        private func deleteSleep(offsets: IndexSet) {
            withAnimation {
                for index in offsets {
                    modelContext.delete(eventDays[index].sleep)
                }
            }
    }
}

#Preview {
    SleepList()
        .modelContainer(SampleData.shared.modelContainer)
}

#Preview("Empty List") {
    SleepList()
        .modelContainer(for: EventDay.self, inMemory: true)
}
