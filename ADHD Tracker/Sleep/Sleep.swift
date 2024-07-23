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
    var calendarDate: Date
    var belongsTo: EventDay?
//    var calendarDate: Day
    
    init(hours: Int, minutes: Int, date: Date) {
        self.hours = hours
        self.minutes = minutes
        self.calendarDate = date
    }
    
    static let sampleData = [
        Sleep(hours: 2, minutes: 39, date: Date.now),
        Sleep(hours: 3, minutes: 48,date: Date.now/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 2000000))*/),
        Sleep(hours: 4, minutes: 47,date: Date.now/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 3603943))*/),
        Sleep(hours: 5, minutes: 46,date: Date.now/*, calendarDate: Day(calendarDate: Date(timeIntervalSinceReferenceDate: 603943))*/),
        Sleep(hours: 6, minutes: 45,date: Date.now),
    ]
}
