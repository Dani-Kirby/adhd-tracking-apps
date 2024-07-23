//
//  SampleData.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import Foundation
import SwiftData


@MainActor
class SampleData {
    static let shared = SampleData()
    let modelContainer : ModelContainer
    
    var context : ModelContext {
        modelContainer.mainContext
    }
    
    private init() {
        let schema = Schema([
            BloodPressure.self,
            Sleep.self,
            ScreenTime.self,
            EventDay.self,
            Medication.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        
        do {
            modelContainer =  try ModelContainer(for: schema, configurations: [modelConfiguration])
            insertSampleData()
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
        
    }
    
    func insertSampleData() {
        for bloodPressure in BloodPressure.sampleData {
            context.insert(bloodPressure)
        }
        for sleep in Sleep.sampleData {
            context.insert(sleep)
        }
        for screenTime in ScreenTime.sampleData {
            context.insert(screenTime)
        }
        for eventDay in EventDay.sampleData {
            context.insert(eventDay)
        }
        for medication in Medication.sampleData {
            context.insert(medication)
        }
        
        BloodPressure.sampleData[0].belongsTo = EventDay.sampleData[0]
        BloodPressure.sampleData[1].belongsTo = EventDay.sampleData[1]
        BloodPressure.sampleData[2].belongsTo = EventDay.sampleData[2]
        BloodPressure.sampleData[3].belongsTo = EventDay.sampleData[3]
        BloodPressure.sampleData[4].belongsTo = EventDay.sampleData[4]
        
        Sleep.sampleData[0].belongsTo = EventDay.sampleData[0]
        Sleep.sampleData[1].belongsTo = EventDay.sampleData[1]
        Sleep.sampleData[2].belongsTo = EventDay.sampleData[2]
        Sleep.sampleData[3].belongsTo = EventDay.sampleData[3]
        Sleep.sampleData[4].belongsTo = EventDay.sampleData[4]
        
        ScreenTime.sampleData[0].belongsTo = EventDay.sampleData[0]
        ScreenTime.sampleData[1].belongsTo = EventDay.sampleData[1]
        ScreenTime.sampleData[2].belongsTo = EventDay.sampleData[2]
        ScreenTime.sampleData[3].belongsTo = EventDay.sampleData[3]
        ScreenTime.sampleData[4].belongsTo = EventDay.sampleData[4]

        Medication.sampleData[0].belongsTo = EventDay.sampleData[0]
        Medication.sampleData[1].belongsTo = EventDay.sampleData[1]
        Medication.sampleData[2].belongsTo = EventDay.sampleData[2]
        Medication.sampleData[3].belongsTo = EventDay.sampleData[3]
        Medication.sampleData[4].belongsTo = EventDay.sampleData[4]
        
        do {
            try context.save()
        } catch {
            print("Sample data context failed to save.")
        }
        
    }
    
    var bloodPressure : BloodPressure {
        BloodPressure.sampleData[0]
    }
    var sleep: Sleep {
        Sleep.sampleData[0]
    }
    var screenTime: ScreenTime {
        ScreenTime.sampleData[0]
    }
    var eventDay: EventDay {
        EventDay.sampleData[0]
    }
    var medication: Medication {
        Medication.sampleData[0]
    }
}
