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
    @State private var newBloodPressure : BloodPressure?
    
    var body: some View {
        NavigationSplitView {
            Group {
                if !bloodPressures.isEmpty {
                    List {
                        ForEach(bloodPressures) { bloodPressure in
                            NavigationLink {
                                BloodPressureDetail(bloodPressure: bloodPressure)
                                    .navigationTitle("Blood Pressure")
                            } label: {
                                HStack {
                                    Text("\(String(describing: bloodPressure.calendarDate.calendarDate.formatted(date: .complete, time: .omitted)))")
                                    Spacer()
                                    Text(bloodPressure.time, format: Date.FormatStyle(time: .shortened))
                                    Spacer()
                                    Text("\(bloodPressure.systolic)/\(bloodPressure.diastolic)")
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
            .sheet(item: $newBloodPressure) { bloodPressure in
                NavigationStack {
                    BloodPressureDetail(bloodPressure: bloodPressure, isNew: true)
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
                let newItem = BloodPressure(systolic: 0, diastolic: 0, time: .now, calendarDate: RecordedDay(calendarDate: .now))
                modelContext.insert(newItem)
                newBloodPressure = newItem
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
        .modelContainer(for: BloodPressure.self, inMemory: true)
}
