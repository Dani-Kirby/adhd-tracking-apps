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
        
        EventDay.sampleData[0].bloodPressure = BloodPressure.sampleData[0]
        EventDay.sampleData[1].bloodPressure = BloodPressure.sampleData[1]
        EventDay.sampleData[2].bloodPressure = BloodPressure.sampleData[2]
        EventDay.sampleData[3].bloodPressure = BloodPressure.sampleData[3]
        EventDay.sampleData[4].bloodPressure = BloodPressure.sampleData[4]
        
        EventDay.sampleData[0].sleep = Sleep.sampleData[0]
        EventDay.sampleData[1].sleep = Sleep.sampleData[1]
        EventDay.sampleData[2].sleep = Sleep.sampleData[2]
        EventDay.sampleData[3].sleep = Sleep.sampleData[3]
        EventDay.sampleData[4].sleep = Sleep.sampleData[4]
        
        EventDay.sampleData[0].screenTime = ScreenTime.sampleData[0]
        EventDay.sampleData[1].screenTime = ScreenTime.sampleData[1]
        EventDay.sampleData[2].screenTime = ScreenTime.sampleData[2]
        EventDay.sampleData[3].screenTime = ScreenTime.sampleData[3]
        EventDay.sampleData[4].screenTime = ScreenTime.sampleData[4]
        
        EventDay.sampleData[0].medication = Medication.sampleData[0]
        EventDay.sampleData[1].medication = Medication.sampleData[1]
        EventDay.sampleData[2].medication = Medication.sampleData[2]
        EventDay.sampleData[3].medication = Medication.sampleData[3]
        EventDay.sampleData[4].medication = Medication.sampleData[4]

        
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
