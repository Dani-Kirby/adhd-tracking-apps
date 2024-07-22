//
//  EventDayDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/18/24.
//

import SwiftUI

struct EventDayDetail: View {
    @Bindable var eventDay : EventDay
    let isNew : Bool
    
//    @State private var screenTime: ScreenTime
//    @State private var bloodPressure: BloodPressure
//    @State private var sleep: Sleep
    
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    
    init(eventDay: EventDay, isNew: Bool = false) {
        self.eventDay = eventDay
        self.isNew = isNew
    }
    
    
    var body: some View {
        Group{
            Form {
                Section {
                    DatePicker("Date", selection: $eventDay.calendarDate, displayedComponents: .date)
                }
              
                Section(header: Text("Screen Time Data")) {
                    Picker("Hours", selection: $eventDay.screenTime.hours) {
                        ForEach(0...16, id: \.self) {
                            hours in
                            Text("\(hours)")
                        }
                    }
                    Picker("Minutes", selection: $eventDay.screenTime.minutes) {
                        ForEach(0...59, id: \.self) {
                            minutes in
                            Text("\(minutes)")
                        }
                    }
                }
                
                Section(header: Text("Blood Pressure")) {
                    
                    DatePicker("Time", selection: $eventDay.calendarDate, displayedComponents: .hourAndMinute)
                    Picker("Systolic", selection: $eventDay.bloodPressure.systolic) {
                        ForEach(100...200, id: \.self) {
                            systolic in
                            Text("\(systolic)")
                        }
                    }
                    Picker("Diastolic", selection: $eventDay.bloodPressure.diastolic) {
                        ForEach(40...120, id: \.self) {
                            diastolic in
                            Text("\(diastolic)")
                        }
                    }
                }
 
                Section(header: Text("Sleep")) {
                    Picker("Hours", selection: $eventDay.sleep.hours) {
                        ForEach(0...16, id: \.self) {
                            hours in
                            Text("\(hours)")
                        }
                    }
                    Picker("Minutes", selection: $eventDay.sleep.minutes) {
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
        EventDayDetail(eventDay: SampleData.shared.eventDay)
    }
    .modelContainer(SampleData.shared.modelContainer)
}

#Preview("New Day") {
    NavigationStack {
        EventDayDetail(eventDay: SampleData.shared.eventDay, isNew: true)
//            .navigationBarTitleDisplayMode(.inline)
         
    }
    .modelContainer(SampleData.shared.modelContainer)
}
