//
//  Sleep.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import Foundation
import SwiftData

@Model
final class Sleep {
    var hours: Int
    var minutes: Int
    var calendarDate: RecordedDay
    
    init(hours: Int, minutes: Int, calendarDate: RecordedDay) {
        self.hours = hours
        self.minutes = minutes
        self.calendarDate = calendarDate
    }
    
    static let sampleData = [
        Sleep(hours: 2, minutes: 39, calendarDate: RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: 20000))),
        Sleep(hours: 3, minutes: 48, calendarDate: RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: 2000000))),
        Sleep(hours: 4, minutes: 47, calendarDate: RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: 3603943))),
        Sleep(hours: 5, minutes: 46, calendarDate: RecordedDay(calendarDate: Date(timeIntervalSinceReferenceDate: 603943))),
        Sleep(hours: 6, minutes: 45, calendarDate: RecordedDay(calendarDate: .now)),
        Sleep(hours: 7, minutes: 44, calendarDate: RecordedDay(calendarDate: .now)),
    ]
}
