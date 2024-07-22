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
//    var calendarDate: Day
    
    init(hours: Int, minutes: Int/*, calendarDate: Day*/) {
        self.hours = hours
        self.minutes = minutes
//        self.calendarDate = calendarDate
    }
    
    static let sampleData = [
        ScreenTime(hours: 3, minutes: 18/*,calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 20000))*/),
        ScreenTime(hours: 1, minutes: 42/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 2000000))*/),
        ScreenTime(hours: 2, minutes: 03/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 3603943))*/),
        ScreenTime(hours: 6, minutes: 25/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 603943))*/),
        ScreenTime(hours: 2, minutes: 14/*, calendarDate: Day(calendarDate: .now)*/),
        ScreenTime(hours: 0, minutes: 59/*, calendarDate: Day(calendarDate: .now)*/),
    ]
}
