//
//  ScreenTime.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import Foundation
import SwiftData

@Model
final class ScreenTime {
    var hours: Int
    var minutes: Int
    var calendarDate: RecordedDay
    
    init(hours: Int, minutes: Int, calendarDate: RecordedDay) {
        self.hours = hours
        self.minutes = minutes
        self.calendarDate = calendarDate
    }
    
    static let sampleData = [
        ScreenTime(hours: 3, minutes: 18,calendarDate: RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: 20000))),
        ScreenTime(hours: 1, minutes: 42, calendarDate: RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: 2000000))),
        ScreenTime(hours: 2, minutes: 03, calendarDate: RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: 3603943))),
        ScreenTime(hours: 6, minutes: 25, calendarDate: RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: 603943))),
        ScreenTime(hours: 2, minutes: 14, calendarDate: RecordedDay(calendarDate: .now)),
        ScreenTime(hours: 0, minutes: 59, calendarDate: RecordedDay(calendarDate: .now)),
    ]
}
