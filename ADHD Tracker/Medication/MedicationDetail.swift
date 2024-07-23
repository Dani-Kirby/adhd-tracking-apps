//
//  MedicationDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/22/24.
//

import SwiftUI
import SwiftData

struct MedicationDetail: View {
    @Bindable var medication: Medication
    let isNew: Bool
    
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    @Query private var eventDays: [EventDay]
    @Query private var medications: [Medication]
    
    init(medication: Medication, isNew: Bool = false) {
        self.medication = medication
        self.isNew = isNew
    }
    
    var body: some View {
        Form {
            DatePicker("Date", selection: $medication.calendarDate, displayedComponents: [.date])
            DatePicker("Time", selection: $medication.time, displayedComponents: .hourAndMinute)
            Picker("Medication", selection: $medication.name) {
                Text("Other")
                    .tag(nil as Medication?)
                ForEach(medications) { med in
                    Text(med.name)
                        .tag(med as Medication?)
                }
            }
            Toggle("Took Dose?", isOn: $medication.tookAll)
        }
        .navigationTitle(isNew ? "Record Med Dose" : "Edit Med Dose")
        .toolbar{
            if isNew {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        modelContext.delete(medication)
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        MedicationDetail(medication: SampleData.shared.medication)
    }
    .modelContainer(SampleData.shared.modelContainer)
}
#Preview("New Medication") {
    NavigationStack {
        MedicationDetail(medication: SampleData.shared.medication, isNew: true)
            .navigationBarTitleDisplayMode(.inline)
    }
    .modelContainer(SampleData.shared.modelContainer)
}
