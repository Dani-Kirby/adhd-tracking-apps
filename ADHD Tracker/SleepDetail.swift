//
//  BloodPressureDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/16/24.
//

import SwiftUI
import SwiftData

struct SleepDetail: View {
    @Bindable var sleep : Sleep
    let isNew : Bool
    
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    init(sleep: Sleep, isNew: Bool = false) {
        self.sleep = sleep
        self.isNew = isNew
    }
    
    
    var body: some View {
        Form {
            DatePicker("Date", selection: $sleep.calendarDate.calendarDate, displayedComponents: .date)
            Picker("Hours", selection: $sleep.hours) {
                ForEach(0...23, id: \.self) {
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
                        modelContext.delete(sleep)
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        SleepDetail(sleep: SampleData.shared.sleep)
    }
    .modelContainer(SampleData.shared.modelContainer)
}

#Preview("New Sleep") {
    NavigationStack {
        SleepDetail(sleep: SampleData.shared.sleep, isNew: true)
//            .navigationBarTitleDisplayMode(.inline)
         
    }
    .modelContainer(SampleData.shared.modelContainer)
}
