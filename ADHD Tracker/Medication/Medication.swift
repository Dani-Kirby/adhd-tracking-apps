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
    var dosage: String
    var units: String
    var time: Date
    var taken: Bool
    
    init(name: String, dosage: String, units: String, time: Date, taken: Bool) {
        self.name = name
        self.dosage = dosage
        self.units = units
        self.time = time
        self.taken = taken
    }
    
    static let sampleData = [
        Medication(name: "", dosage: "", units: "", time: Date.now, taken: true),
        Medication(name: "", dosage: "", units: "", time: Date.now, taken: true),
        Medication(name: "", dosage: "", units: "", time: Date.now, taken: false),
        Medication(name: "", dosage: "", units: "", time: Date.now, taken: true),
        Medication(name: "", dosage: "", units: "", time: Date.now, taken: false),
    ]
}
