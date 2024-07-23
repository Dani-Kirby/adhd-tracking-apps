//
//  Medication.swift
//  ADHD Tracker
//
//  Created by Dani Kirby on 7/15/24.
//

import Foundation
import SwiftData

@Model
final class Medication {
    var name: String
    var dosage: Int
    var units: String
    var calendarDate: Date
    var time: Date
    var taken: Bool
    var scheduleStart: Int
    var scheduleEnd: Int
    var belongsTo: EventDay?
    
    init(name: String, dosage: Int, units: String, date: Date, time: Date, taken: Bool, scheduleStart: Int, scheduleEnd: Int) {
        self.name = name
        self.dosage = dosage
        self.units = units
        self.calendarDate = date
        self.time = time
        self.taken = taken
        self.scheduleStart = scheduleStart
        self.scheduleEnd = scheduleEnd
    }
    
    static let sampleData = [
        Medication(name: "Adderall", dosage: 20, units: "mg", date: Date.now, time: Date.now, taken: true, scheduleStart: 8, scheduleEnd: 9),
        Medication(name: "Citalopram", dosage: 15, units: "mg", date: Date.now,time: Date.now, taken: true, scheduleStart: 21, scheduleEnd: 23),
        Medication(name: "Zyrtec", dosage: 10, units: "mg", date: Date.now,time: Date.now, taken: false, scheduleStart: 9, scheduleEnd: 10),
        Medication(name: "Vitamin D", dosage: 2000, units: "iu", date: Date.now,time: Date.now, taken: true, scheduleStart: 9, scheduleEnd: 10),
        Medication(name: "Omega 3", dosage: 1500, units: "iu", date: Date.now,time: Date.now, taken: false, scheduleStart: 9, scheduleEnd: 11),
    ]
}
