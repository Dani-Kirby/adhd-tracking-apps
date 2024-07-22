//
//  BloodPressureList.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import SwiftUI
import SwiftData

struct BloodPressureList: View {
    @Environment(\.modelContext) private var modelContext
//    @Query (sort:\BloodPressure.time) private var bloodPressures: [BloodPressure]
    @Query private var eventDays: [EventDay]
    @State private var newDay : EventDay?
    
    var body: some View {
        NavigationSplitView {
            Group {
                if !eventDays.isEmpty {
                    List {
                        ForEach(eventDays) { day in
                            NavigationLink {
                                BloodPressureDetail(eventDay: day)
                                    .navigationTitle("Blood Pressure")
                            } label: {
                                HStack {
                                    Text("\( day.calendarDate.formatted(date: .complete, time: .omitted))")
                                    Spacer()
                                    Text(day.bloodPressure.time, format: Date.FormatStyle(time: .shortened))
                                    Spacer()
                                    Text("\(day.bloodPressure.systolic)/\(day.bloodPressure.diastolic)")
                                }

                            }
                        }
                        .onDelete(perform: deleteBloodPressure)
                    }
                } else {
                    ContentUnavailableView("No Blood Pressures", systemImage: "suit.heart")
                }
            }
            .navigationTitle("Blood Pressures")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
                ToolbarItem {
                    Button(action: addBloodPressure) {
                        Label("Add Blood Pressure", systemImage: "plus")
                    }
                }
            }
            .sheet(item: $newDay) { day in
                NavigationStack {
                    BloodPressureDetail(eventDay: day, isNew: true)
                }
                .interactiveDismissDisabled()
            }
        } detail: {
            Text("Select an item")
                .navigationTitle("Blood Pressure")
            }
        }
        
        private func addBloodPressure() {
            withAnimation {
                let newItem = EventDay(calendarDate: Date.now, sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: false))
                modelContext.insert(newItem)
                newDay = newItem
            }
        }
        
        private func deleteBloodPressure(offsets: IndexSet) {
            withAnimation {
                for index in offsets {
                    modelContext.delete(eventDays[index].bloodPressure)
                }
            }
    
    }
}

#Preview {
    BloodPressureList()
        .modelContainer(SampleData.shared.modelContainer)
}

#Preview("Empty List") {
    BloodPressureList()
        .modelContainer(for: EventDay.self, inMemory: true)
}
