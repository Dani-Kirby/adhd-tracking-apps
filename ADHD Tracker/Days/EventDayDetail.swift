//
//  EventDayDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/18/24.
//

import SwiftUI
import SwiftData

struct EventDayDetail: View {
    @Bindable var eventDay : EventDay
    @Bindable var screenTime: ScreenTime
    @Bindable var bloodPressure: BloodPressure
    @Bindable var sleep: Sleep
    @Bindable var medication: Medication
    let isNew : Bool
    
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
//    @Query private var screenTimes: [ScreenTime]
//    @Query private var bloodPressures: [BloodPressure]
//    @Query private var sleeps: [Sleep]
    @Query(sort:\Medication.calendarDate) private var medications: [Medication]

    init(eventDay: EventDay, screenTime: ScreenTime, bloodPressure: BloodPressure, sleep: Sleep, medication: Medication, isNew: Bool = false) {
        self.eventDay = eventDay
        self.screenTime = screenTime
        self.bloodPressure = bloodPressure
        self.sleep = sleep
        self.medication = medication
        self.isNew = isNew
    }
    
    
    var body: some View {
        Group{
            Form {
                Section {
                    DatePicker("Date", selection: $eventDay.calendarDate, displayedComponents: .date)
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
                    DatePicker("Time", selection: $eventDay.calendarDate, displayedComponents: .hourAndMinute)
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
                Section(header: Text("Medications")) {
                    ForEach(medications) {
                        med in
                        HStack {
//                            Text("\(med.name)")
                            Toggle("\(med.name)", isOn: $medication.tookAll)
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
                            modelContext.delete(eventDay)
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
        EventDayDetail(eventDay: SampleData.shared.eventDay, screenTime: SampleData.shared.screenTime, bloodPressure: SampleData.shared.bloodPressure, sleep: SampleData.shared.sleep, medication: SampleData.shared.medication)
    }
    .modelContainer(SampleData.shared.modelContainer)
}

#Preview("New Day") {
    NavigationStack {
        EventDayDetail(eventDay: SampleData.shared.eventDay, screenTime: SampleData.shared.screenTime, bloodPressure: SampleData.shared.bloodPressure, sleep: SampleData.shared.sleep, medication: SampleData.shared.medication, isNew: true)
//            .navigationBarTitleDisplayMode(.inline)
         
    }
    .modelContainer(SampleData.shared.modelContainer)
}
