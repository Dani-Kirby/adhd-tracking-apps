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
    
    init(medication: Medication, isNew: Bool = false) {
        self.medication = medication
        self.isNew = isNew
    }
    
    var body: some View {
        Form {
            DatePicker("Time", selection: $medication.calendarDate, displayedComponents: [.hourAndMinute])
        }
    }
}

#Preview {
    NavigationStack {
        MedicationDetail(medication: SampleData.shared.medication)
    }
}
#Preview("New Medication") {
    NavigationStack {
        MedicationDetail(medication: SampleData.shared.medication, isNew: true)
            .navigationBarTitleDisplayMode(.inline)
    }
}
