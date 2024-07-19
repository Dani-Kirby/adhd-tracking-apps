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
            RecordedDay.self
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
        for day in RecordedDay.sampleData {
            context.insert(day)
        }
//        for medication in Medication.sampleData {
//            context.insert(medication)
//        }
        
//        RecordedDay.sampleData[0].calendarDate = BloodPressure.sampleData[0].calendarDate
//        RecordedDay.sampleData[1].calendarDate = BloodPressure.sampleData[1].calendarDate

//        Sleep.sampleData[0].calendarDate = RecordedDay.sampleData[0]
//        Sleep.sampleData[1].calendarDate = RecordedDay.sampleData[1]
//        Sleep.sampleData[2].calendarDate = RecordedDay.sampleData[2]
//        RecordedDay.sampleData[0].calendarDate = Sleep.sampleData[0].calendarDate
//        RecordedDay.sampleData[1].calendarDate = Sleep.sampleData[1].calendarDate

        
//        RecordedDay.sampleData[0].calendarDate = ScreenTime.sampleData[0].calendarDate
//        RecordedDay.sampleData[1].calendarDate = ScreenTime.sampleData[1].calendarDate



        
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
    var recordedDay: RecordedDay {
        RecordedDay.sampleData[0]
    }
}
