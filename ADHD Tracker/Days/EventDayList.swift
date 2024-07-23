//
//  EventDayList.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/18/24.
//

import SwiftUI
import SwiftData

struct EventDayList: View {
    @Environment(\.modelContext) private var modelContext
    @Query (sort:\EventDay.calendarDate) private var eventDays : [EventDay]

    @State private var newDay : EventDay?
    
    var body: some View {
    NavigationSplitView {
        Group {
            if !eventDays.isEmpty {
                List {
                    ForEach(eventDays) { day in
                        NavigationLink {
                            EventDayDetail(eventDay: day, screenTime: day.screenTime ?? ScreenTime(hours: 0, minutes: 0, date: Date.now), bloodPressure: day.bloodPressure ?? BloodPressure(systolic: 120, diastolic: 80, time: Date.now, date: Date.now), sleep: day.sleep ?? Sleep(hours: 0, minutes: 0, date: Date.now), medication: day.medication ?? Medication(name: "", dosage: 0, units: "", date: Date.now, time: Date.now, taken: false, scheduleStart: 8, scheduleEnd: 10))
                        } label: {
                            HStack {
                                Text("\(day.calendarDate.formatted(date: .complete, time: .omitted))")
                                Spacer()
                            }

                        }
                    }
                    .onDelete(perform: deleteRecordedDay)
                }
            } else {
                ContentUnavailableView("No Data", systemImage: "iphone.gen1.slash")
            }
        }
        .navigationTitle("Recorded Data")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                EditButton()
            }
            ToolbarItem {
                Button(action: addDay) {
                    Label("Add Recorded Day", systemImage: "plus")
                }
            }
        }
        .sheet(item: $newDay) { day in
            NavigationStack {
                EventDayDetail(eventDay: day, screenTime: day.screenTime ?? ScreenTime(hours: 0, minutes: 0, date: Date.now), bloodPressure: day.bloodPressure ?? BloodPressure(systolic: 120, diastolic: 80, time: Date.now, date: Date.now), sleep: day.sleep ?? Sleep(hours: 0, minutes: 0, date: Date.now), medication: day.medication ?? Medication(name: "", dosage: 0, units: "", date: Date.now, time: Date.now, taken: false, scheduleStart: 8, scheduleEnd: 10), isNew: true)
            }
            .interactiveDismissDisabled()
        }
    } detail: {
        Text("Select an item")
            .navigationTitle("Recorded Day")
        }
        
    }
    
    private func addDay() {
        withAnimation {
            let newItem = EventDay(calendarDate: Date(timeIntervalSinceNow: -1000))
            modelContext.insert(newItem)
            newDay = newItem
        }
    }
    
    private func deleteRecordedDay(offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                modelContext.delete(eventDays[index])
            }
        }

    }
}

#Preview {
    EventDayList()
        .modelContainer(SampleData.shared.modelContainer)
}

#Preview("Empty List") {
    EventDayList()
        .modelContainer(for: EventDay.self, inMemory: true)
}
