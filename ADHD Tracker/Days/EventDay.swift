//
//  EventDay.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/18/24.
//

import Foundation
import SwiftData

@Model
final class EventDay {
    var calendarDate: Date
    var sleep: Sleep
    var screenTime: ScreenTime
    var bloodPressure: BloodPressure
    var medication: Medication
//    @var recordedMeds = [Meds]()
    
    init(calendarDate: Date, sleep: Sleep, screenTime: ScreenTime, bloodPressure: BloodPressure, medication: Medication) {
        self.calendarDate = calendarDate
        self.sleep = sleep
        self.screenTime = screenTime
        self.bloodPressure = bloodPressure
        self.medication = medication
    }
    
    
    static let sampleData = [
        EventDay(calendarDate: Date(timeIntervalSinceReferenceDate: -20_000_000), sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: false)),
        EventDay(calendarDate: Date(timeIntervalSinceReferenceDate: -19_000_000), sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: false)),
        EventDay(calendarDate: Date(timeIntervalSinceReferenceDate: -18_000_000), sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: true)),
        EventDay(calendarDate: Date(timeIntervalSinceReferenceDate: -17_000_000), sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: false)),
        EventDay(calendarDate: Date(timeIntervalSinceReferenceDate: -16_000_000), sleep: Sleep(hours: 0, minutes: 0), screenTime: ScreenTime(hours: 0, minutes: 0), bloodPressure: BloodPressure(systolic: 0, diastolic: 0, time: Date.now), medication: Medication(name: "", dosage: "", units: "", time: Date.now, taken: true)),
    ]
}
