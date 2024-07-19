//
//  RecordedDay.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/18/24.
//

import Foundation
import SwiftData

@Model
final class RecordedDay {
    var calendarDate: Date
//    var data: []
    @Relationship(inverse: \Sleep.calendarDate ) var sleep: Sleep?
    @Relationship(inverse: \ScreenTime.calendarDate )var screenTime: ScreenTime?
    @Relationship(inverse: \BloodPressure.calendarDate )var bloodPressure: BloodPressure?
//    @Relationship(inverse: \Meds.calendarDate) var recordedMeds: Meds?
    
    init(calendarDate: Date) {
        self.calendarDate = calendarDate
    }
    
    
    static let sampleData = [
        RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: -20_000_000)),
        RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: -19_000_000)),
        RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: -18_000_000)),
        RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: -17_000_000)),
        RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: -16_000_000)),
    ]
}
