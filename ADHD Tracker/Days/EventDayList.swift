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
                            EventDayDetail(eventDay: day)
                                .navigationTitle("Recorded Day")
                        } label: {
                            HStack {
                                Text("\(day.calendarDate.formatted(date: .complete, time: .omitted))")
                                Spacer()
//                                Text("\(screenTimes[0].hours)")
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
                EventDayDetail(eventDay: day, isNew: true)
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
            let newItem = EventDay(calendarDate: Date(timeIntervalSinceNow: -1000), sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: false))
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
