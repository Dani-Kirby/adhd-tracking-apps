//
//  BloodPressure.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import Foundation
import SwiftData

@Model
final class BloodPressure {
    var systolic: Int
    var diastolic: Int
    var time: Date
//    var calendarDate: Date
    
    init(systolic: Int, diastolic: Int, time: Date/*, calendarDate: Date*/) {
        self.systolic = systolic
        self.diastolic = diastolic
        self.time = time
//        self.calendarDate = calendarDate
    }
    
    static let sampleData = [
        BloodPressure(systolic: 120, diastolic: 80, time: Date(timeIntervalSinceReferenceDate: -402_000_000)/*),
        ,calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 20000)*/),
        BloodPressure(systolic: 135, diastolic: 85, time: Date(timeIntervalSinceReferenceDate: -20_000_000)/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 2000000))*/),
        BloodPressure(systolic: 122, diastolic: 67, time: Date(timeIntervalSinceReferenceDate: 300_000_000)/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 3603943))*/),
        BloodPressure(systolic: 124, diastolic: 84, time: Date(timeIntervalSinceReferenceDate: 120_000_000)/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 603943))*/),
        BloodPressure(systolic: 118, diastolic: 64, time: Date(timeIntervalSinceReferenceDate: 550_000_000)/*, calendarDate: Day(calendarDate: .now)*/),
        BloodPressure(systolic: 134, diastolic: 87, time: Date(timeIntervalSinceReferenceDate: 700_000_000)/*, calendarDate: Day(calendarDate: .now)*/)
    ]
}
