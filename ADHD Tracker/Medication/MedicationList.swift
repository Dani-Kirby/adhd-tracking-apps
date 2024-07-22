//
//  MedicationList.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/22/24.
//

import SwiftUI
import SwiftData

struct MedicationList: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort:\EventDay.calendarDate) private var eventDays: [EventDay]
    @State private var newDay: EventDay?
    
    var body: some View {
        NavigationSplitView {
            Group {
                if !eventDays.isEmpty {
                    List {
                        ForEach(eventDays) {
                            day in
                            NavigationLink {
                                MedicationDetail(eventDay: day)
                            } label: {
                                HStack {
                                    Text("\(day.calendarDate.formatted(date: .complete, time: .omitted))")
                                    Spacer()
                                    Text("\(day.medication.taken)")
                                }
                            }
                        }
                        .onDelete(perform: deleteMed)
                    }
                } else {
                    ContentUnavailableView("No Meds", systemImage: "pill.fill")
                }
            }
            .navigationTitle("Medication")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
                ToolbarItem {
                    Button(action: addMed) {
                        Label("Add Medication", systemImage: "plus")
                    }
                }
            }
            .sheet(item: $newDay) { day in
                NavigationStack {
                    MedicationDetail(eventDay: day, isNew: true)
                }
                .interactiveDismissDisabled()
            }
        } detail: {
            Text("Select an item")
                .navigationTitle("Medication")
        }
    }
    
    private func addMed() {
        withAnimation {
            let newItem = EventDay(calendarDate: Date.now, sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: false))
            modelContext.insert(newItem)
            newDay = newItem
        }
    }
    
    private func deleteMed(offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                modelContext.delete(eventDays[index].medication
                )
            }
        }
    }
}

#Preview {
    MedicationList()
        .modelContainer(SampleData.shared.modelContainer)
}

#Preview("Empty List") {
    MedicationList()
        .modelContainer(for: EventDay.self, inMemory: true)
}
