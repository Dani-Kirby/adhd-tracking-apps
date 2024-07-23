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
    @Query (sort:\BloodPressure.time) private var bloodPressures: [BloodPressure]
    @State private var newBP : BloodPressure?
    
    var body: some View {
        NavigationSplitView {
            Group {
                if !bloodPressures.isEmpty {
                    List {
                        ForEach(bloodPressures) { bp in
                            NavigationLink {
                                BloodPressureDetail(bloodPressure: bp)
                                    .navigationTitle("Blood Pressure")
                            } label: {
                                HStack {
                                    Text("\( bp.calendarDate.formatted(date: .complete, time: .omitted))")
                                    Spacer()
                                    Text(bp.time, format: Date.FormatStyle(time: .shortened))
                                    Spacer()
                                    Text("\(bp.systolic)/\(bp.diastolic)")

                                    
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
            .sheet(item: $newBP) { bp in
                NavigationStack {
                    BloodPressureDetail(bloodPressure: bp, isNew: true)
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
                let newItem = BloodPressure(systolic: 120, diastolic: 80, time: Date.now, date: Date.now)
                modelContext.insert(newItem)
                newBP = newItem
            }
        }
        
        private func deleteBloodPressure(offsets: IndexSet) {
            withAnimation {
                for index in offsets {
                    modelContext.delete(bloodPressures[index])
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
