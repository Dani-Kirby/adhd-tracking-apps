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
    @Query (sort:\Sleep.calendarDate) private var sleeps: [Sleep]
    @State private var newSleep : Sleep?
    
    var body: some View {
        NavigationSplitView {
            Group {
                if !sleeps.isEmpty {
                    List {
//                        for (index, day) in eventDays.enumerated() {
//                            Text(day)
//                            Text(index)
//                        }
                        ForEach(sleeps) {
                            sleep in
                            NavigationLink {
                                SleepDetail(sleep: sleep)
                            } label: {
                                HStack {
                                    Text("\(sleep.calendarDate.formatted(date: .complete, time: .omitted))")
                                    Spacer()
                                    Text("\(sleep.hours)h \(sleep.minutes)m")
                                    
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
            .sheet(item: $newSleep) { sleep in
                NavigationStack {
                    SleepDetail(sleep: sleep, isNew: true)
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
                let newItem = Sleep(hours: 0, minutes: 0, date: Date.now)
                modelContext.insert(newItem)
                newSleep = newItem
            }
        }
        
        private func deleteSleep(offsets: IndexSet) {
            withAnimation {
                for index in offsets {
                    modelContext.delete(sleeps[index])
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
