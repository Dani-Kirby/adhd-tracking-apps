//
//  MedicationDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/22/24.
//

import SwiftUI
import SwiftData

struct MedicationDetail: View {
    @Bindable var eventDay: EventDay
    let isNew: Bool
    
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    init(eventDay: EventDay, isNew: Bool = false) {
        self.eventDay = eventDay
        self.isNew = isNew
    }
    
    var body: some View {
        Form {
            DatePicker("Time", selection: $eventDay.medication.time, displayedComponents: [.hourAndMinute])
        }
    }
}

#Preview {
    NavigationStack {
        MedicationDetail(eventDay: SampleData.shared.eventDay)
    }
}
#Preview("New Medication") {
    NavigationStack {
        MedicationDetail(eventDay: SampleData.shared.eventDay, isNew: true)
            .navigationBarTitleDisplayMode(.inline)
    }
}
