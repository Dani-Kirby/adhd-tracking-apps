//
//  BloodPressureDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/16/24.
//

import SwiftUI
import SwiftData

struct SleepDetail: View {
    @Bindable var eventDay: EventDay
    let isNew : Bool
    
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    init(eventDay: EventDay, isNew: Bool = false) {
        self.eventDay = eventDay
        self.isNew = isNew
    }
    
    
    var body: some View {
        Form {
            DatePicker("Date", selection: $eventDay.calendarDate, displayedComponents: .date)
            Picker("Hours", selection: $eventDay.sleep.hours) {
                ForEach(0...23, id: \.self) {
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
        .navigationTitle(isNew ? "Record Sleep" : "Edit Sleep")
        .toolbar{
            if isNew {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        modelContext.delete(eventDay.sleep)
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        SleepDetail(eventDay: SampleData.shared.eventDay)
    }
    .modelContainer(SampleData.shared.modelContainer)
}

#Preview("New Sleep") {
    NavigationStack {
        SleepDetail( eventDay: SampleData.shared.eventDay, isNew: true)
            .navigationBarTitleDisplayMode(.inline)
         
    }
    .modelContainer(SampleData.shared.modelContainer)
}
