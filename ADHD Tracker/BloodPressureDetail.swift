//
//  BloodPressureDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/16/24.
//

import SwiftUI
import SwiftData

struct BloodPressureDetail: View {
    @Bindable var bloodPressure : BloodPressure
    let isNew : Bool
    
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    init(bloodPressure: BloodPressure, isNew: Bool = false) {
        self.bloodPressure = bloodPressure
        self.isNew = isNew
    }
    
    
    var body: some View {
        Form {
            DatePicker("Date", selection: $bloodPressure.calendarDate.calendarDate)
            Picker("Systolic", selection: $bloodPressure.systolic) {
                ForEach(80...200, id: \.self) {
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
                        modelContext.delete(bloodPressure)
                        dismiss()
                    }
                }
            }

        }
    }
}

#Preview {
    NavigationStack {
        BloodPressureDetail(bloodPressure: SampleData.shared.bloodPressure)
    }
    .modelContainer(SampleData.shared.modelContainer)
}

#Preview("New BP") {
    NavigationStack {
        BloodPressureDetail(bloodPressure: SampleData.shared.bloodPressure, isNew: true)
//            .navigationBarTitleDisplayMode(.inline)
         
    }
    .modelContainer(SampleData.shared.modelContainer)
}
