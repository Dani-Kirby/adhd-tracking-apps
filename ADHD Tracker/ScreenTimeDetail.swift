//
//  ScreenTimeDetail.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/16/24.
//

import SwiftUI
import SwiftData

struct ScreenTimeDetail: View {
    @Bindable var screenTime : ScreenTime
    let isNew : Bool
    
//    @State private var newDate : Date
    
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    init(screenTime: ScreenTime, isNew: Bool = false) {
        self.screenTime = screenTime
        self.isNew = isNew
    }
    
    
    var body: some View {
        Form {
            DatePicker("Date", selection: $screenTime.calendarDate.calendarDate, displayedComponents: .date)
            Picker("Hours", selection: $screenTime.hours) {
                ForEach(0...23, id: \.self) {
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
        .navigationTitle(isNew ? "Record Screen Time" : "Edit Screen Time")
        .toolbar{
            if isNew {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        modelContext.delete(screenTime)
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        ScreenTimeDetail(screenTime: SampleData.shared.screenTime)
    }
    .modelContainer(SampleData.shared.modelContainer)
}

#Preview("New Screen Time") {
    NavigationStack {
        ScreenTimeDetail(screenTime: SampleData.shared.screenTime, isNew: true)
//            .navigationBarTitleDisplayMode(.inline)
         
    }
    .modelContainer(SampleData.shared.modelContainer)
}
