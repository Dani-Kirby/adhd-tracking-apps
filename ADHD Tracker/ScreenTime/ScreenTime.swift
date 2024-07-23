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
    var calendarDate: Date
    var belongsTo: EventDay?
//    var calendarDate: Day
    
    init(hours: Int, minutes: Int, date: Date) {
        self.hours = hours
        self.minutes = minutes
        self.calendarDate = date
    }
    
    static let sampleData = [
        ScreenTime(hours: 3, minutes: 18, date: Date.now/*,calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 20000))*/),
        ScreenTime(hours: 1, minutes: 42, date: Date.now/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 2000000))*/),
        ScreenTime(hours: 2, minutes: 03, date: Date.now/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 3603943))*/),
        ScreenTime(hours: 6, minutes: 25, date: Date.now/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 603943))*/),
        ScreenTime(hours: 2, minutes: 14, date: Date.now/*, calendarDate: Day(calendarDate: .now)*/),
        ScreenTime(hours: 0, minutes: 59, date: Date.now/*, calendarDate: Day(calendarDate: .now)*/),
    ]
}
