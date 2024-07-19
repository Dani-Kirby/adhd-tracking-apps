//
//  RecordedDayList.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/18/24.
//

import SwiftUI
import SwiftData

struct RecordedDayList: View {
    @Environment(\.modelContext) private var modelContext
    @Query (sort:\RecordedDay.calendarDate) private var recordedDays : [RecordedDay]

    @State private var newDay : RecordedDay
    @State private var newBP : BloodPressure
    @State private var newSleep : Sleep
    @State private var newST : ScreenTime
    
    init(newRecordedDay: RecordedDay, newBP: BloodPressure, newSleep: Sleep, newST: ScreenTime) {
        self.newDay = newRecordedDay
        self.newBP = newBP
        self.newSleep = newSleep
        self.newST = newST
    }
    
    var body: some View {
    NavigationSplitView {
        Group {
            if !recordedDays.isEmpty {
                List {
                    ForEach(recordedDays) { day in
                        NavigationLink {
                            RecordedDayDetail(recordedDay: day, screenTime: ScreenTime(hours: 0, minutes: 0, calendarDate: RecordedDay(calendarDate: .now)), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: .now, calendarDate: RecordedDay(calendarDate: .now)), sleep: Sleep(hours: 0, minutes: 0, calendarDate: RecordedDay(calendarDate: .now) ))
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
                Button(action: addRecordedDay) {
                    Label("Add Recorded Day", systemImage: "plus")
                }
            }
        }
        .sheet(item: $newRecordedDay) { recordedDay in
            NavigationStack {
                RecordedDayDetail(recordedDay: recordedDay, screenTime: ScreenTime(hours: 0, minutes: 0, calendarDate: RecordedDay(calendarDate: .now)), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: .now, calendarDate: RecordedDay(calendarDate: .now)), sleep: Sleep(hours: 0, minutes: 0, calendarDate: RecordedDay(calendarDate: .now)), isNew: true)
            }
            .interactiveDismissDisabled()
        }
    } detail: {
        Text("Select an item")
            .navigationTitle("Recorded Day")
        }
        
    }
    
    private func addRecordedDay() {
        
//        withAnimation {
        let newItem = RecordedDay(calendarDate: .now)
        if newDay.bloodPressure != nil {
            newBP = BloodPressure(systolic: 0, diastolic: 0, time: .now, calendarDate: newItem)
            modelContext.insert(newBP)
            newItem.bloodPressure = newBP
        }
        if newDay.screenTime != nil {
            newST = ScreenTime(hours: 0, minutes: 0,  calendarDate: newItem)
            newItem.screenTime = newST
        }
        if newDay.sleep != nil {
            newSleep = Sleep(hours: 0, minutes: 0,  calendarDate: newItem)
            newItem.sleep = newSleep
        }

        modelContext.insert(newItem)
        newDay = newItem
            
    }
    
    private func deleteRecordedDay(offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                modelContext.delete(recordedDays[index])
            }
        }

}
}

#Preview {
    RecordedDayList(newRecordedDay: SampleData.shared.recordedDay, newBP: SampleData.shared.bloodPressure, newSleep: SampleData.shared.sleep, newST: SampleData.shared.screenTime)
        .modelContainer(SampleData.shared.modelContainer)
}

#Preview("Empty List") {
    RecordedDayList(newRecordedDay: SampleData.shared.recordedDay, newBP: SampleData.shared.bloodPressure, newSleep: SampleData.shared.sleep, newST: SampleData.shared.screenTime)
        .modelContainer(for: RecordedDay.self, inMemory: true)
}
