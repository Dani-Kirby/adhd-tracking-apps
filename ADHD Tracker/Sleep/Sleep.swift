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
//    var calendarDate: Day
    
    init(hours: Int, minutes: Int/*, calendarDate: Day*/) {
        self.hours = hours
        self.minutes = minutes
//        self.calendarDate = calendarDate
    }
    
    static let sampleData = [
        Sleep(hours: 2, minutes: 39/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 20000))*/),
        Sleep(hours: 3, minutes: 48/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 2000000))*/),
        Sleep(hours: 4, minutes: 47/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 3603943))*/),
        Sleep(hours: 5, minutes: 46/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 603943))*/),
        Sleep(hours: 6, minutes: 45/*, calendarDate: Day(calendarDate: .now)*/),
    ]
}
