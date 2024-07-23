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
    @Query(sort:\Medication.calendarDate) private var medications : [Medication]
    
    @State private var newMed: Medication?
    
    var body: some View {
        NavigationSplitView {
            Group {
                if !medications.isEmpty {
                    List {
                        ForEach(medications) {
                            med in
                            NavigationLink {
                                MedicationDetail(medication: med)
                            } label: {
                                HStack {
                                    Text("\(med.calendarDate.formatted(date: .complete, time: .omitted))")
                                    Spacer()
                                    Text("\(med.taken)")
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
            .sheet(item: $newMed) { med in
                NavigationStack {
                    MedicationDetail(medication: med, isNew: true)
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
            let newItem = Medication(name: "", dosage: 0, units: "", date: Date.now, time: Date.now, taken: false, scheduleStart: 8, scheduleEnd: 10)
            modelContext.insert(newItem)
            newMed = newItem
        }
    }
    
    private func deleteMed(offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                modelContext.delete(medications[index]
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
