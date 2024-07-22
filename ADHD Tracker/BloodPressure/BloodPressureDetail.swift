//
//  BloodPressureDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/16/24.
//

import SwiftUI
import SwiftData

struct BloodPressureDetail: View {
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
            DatePicker("Date", selection: $eventDay.calendarDate, displayedComponents: [.date])
            DatePicker("Time", selection: $eventDay.bloodPressure.time, displayedComponents: [.hourAndMinute])
            Picker("Systolic", selection: $eventDay.bloodPressure.systolic) {
                ForEach(80...200, id: \.self) {
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
        .navigationTitle(isNew ? "Record Blood Pressure" : "Edit Blood Pressure")
        .toolbar {
            if isNew {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        modelContext.delete(eventDay.bloodPressure)
                        dismiss()
                    }
                }
            }

        }
    }
}

#Preview {
    NavigationStack {
        BloodPressureDetail(eventDay: SampleData.shared.eventDay)
    }
    .modelContainer(SampleData.shared.modelContainer)
}

#Preview("New BP") {
    NavigationStack {
        BloodPressureDetail(eventDay: SampleData.shared.eventDay, isNew: true)
//            .navigationBarTitleDisplayMode(.inline)
         
    }
    .modelContainer(SampleData.shared.modelContainer)
}
