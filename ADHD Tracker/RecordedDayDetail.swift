//
//  RecordedDayDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/18/24.
//

import SwiftUI

struct RecordedDayDetail: View {
    @Bindable var recordedDay : RecordedDay
    @Bindable var screenTime : ScreenTime
    @Bindable var bloodPressure : BloodPressure
    @Bindable var sleep : Sleep
    let isNew : Bool
    
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    
    init(recordedDay: RecordedDay, screenTime: ScreenTime, bloodPressure: BloodPressure, sleep: Sleep, isNew: Bool = false) {
        self.recordedDay = recordedDay
        self.screenTime = screenTime
        self.bloodPressure = bloodPressure
        self.sleep = sleep
        self.isNew = isNew
    }
    
    
    var body: some View {
        Group{
            Form {
                Section {
                    DatePicker("Date", selection: $recordedDay.calendarDate, displayedComponents: .date)
                }
              
                Section(header: Text("Screen Time Data")) {
                    Picker("Hours", selection: $screenTime.hours) {
                        ForEach(0...16, id: \.self) {
                            hours in
                            Text("\(hours)")
                        }
                    }
                    Picker("Minutes", selection: $screenTime.minutes) {
                        ForEach(0...59, id: \.self) {
                            minutes in
                            Text("\(minutes)")
                        }
                    }
                }
                
                Section(header: Text("Blood Pressure")) {
                    DatePicker("Time", selection: $recordedDay.calendarDate, displayedComponents: .hourAndMinute)
                    Picker("Systolic", selection: $bloodPressure.systolic) {
                        ForEach(100...200, id: \.self) {
                            systolic in
                            Text("\(systolic)")
                        }
                    }
                    Picker("Diastolic", selection: $bloodPressure.diastolic) {
                        ForEach(40...120, id: \.self) {
                            diastolic in
                            Text("\(diastolic)")
                        }
                    }
                }
 
                Section(header: Text("Sleep")) {
                    Picker("Hours", selection: $sleep.hours) {
                        ForEach(0...16, id: \.self) {
                            hours in
                            Text("\(hours)")
                        }
                    }
                    Picker("Minutes", selection: $sleep.minutes) {
                        ForEach(0...59, id: \.self) {
                            minutes in
                            Text("\(minutes)")
                        }
                    }
                }
   
            }
            .navigationTitle(isNew ? "Record Day" : "Edit Day")
            .toolbar{
                if isNew {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") {
                            dismiss()
                        }
                    }
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            modelContext.delete(recordedDay)
                            dismiss()
                        }
                    }
                }
            }
        }

    }
}

#Preview {
    NavigationStack {
        RecordedDayDetail(recordedDay: SampleData.shared.recordedDay, screenTime: SampleData.shared.screenTime, bloodPressure: SampleData.shared.bloodPressure, sleep: SampleData.shared.sleep)
    }
    .modelContainer(SampleData.shared.modelContainer)
}

#Preview("New Day") {
    NavigationStack {
        RecordedDayDetail(recordedDay: SampleData.shared.recordedDay, screenTime: SampleData.shared.screenTime, bloodPressure: SampleData.shared.bloodPressure, sleep: SampleData.shared.sleep, isNew: true)
//            .navigationBarTitleDisplayMode(.inline)
         
    }
    .modelContainer(SampleData.shared.modelContainer)
}
