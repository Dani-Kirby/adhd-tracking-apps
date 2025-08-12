import Foundation

// MARK: - Tag Model
struct Tag: Identifiable, Codable, Hashable {
    var id: String
    var name: String
    var color: String
    
    static func generateRandomID() -> String {
        return UUID().uuidString.prefix(8).description
    }
    
    static func generateRandomColor() -> String {
        let colors = [
            "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
            "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
            "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800",
            "#FF5722", "#795548", "#9E9E9E", "#607D8B"
        ]
        return colors[Int.random(in: 0..<colors.count)]
    }
}

// MARK: - Base TrackableItem Protocol
protocol TrackableItem: Identifiable, Codable {
    var id: String { get set }
    var date: Date { get set }
    var tags: [Tag] { get set }
    var notes: String? { get set }
}

// MARK: - Sleep Entry
struct SleepEntry: TrackableItem, Hashable {
    var id: String
    var date: Date
    var tags: [Tag]
    var notes: String?
    
    var startTime: Date
    var endTime: Date
    var quality: Int // 1-5 scale
    
    var durationInHours: Double {
        return endTime.timeIntervalSince(startTime) / 3600
    }
}

// MARK: - Screen Time Entry
struct ScreenTimeEntry: TrackableItem, Hashable {
    var id: String
    var date: Date
    var tags: [Tag]
    var notes: String?
    
    var duration: Int // in minutes
    var device: String?
    var category: String?
    
    var formattedDuration: String {
        let hours = duration / 60
        let minutes = duration % 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}

// MARK: - Medication Dose
struct MedicationDose: Codable, Hashable {
    var scheduledTime: Date
    var takenTime: Date?
    var taken: Bool
}

// MARK: - Medication Entry
struct MedicationEntry: TrackableItem, Hashable {
    var id: String
    var date: Date
    var tags: [Tag]
    var notes: String?
    
    var medication: String
    var dosage: String
    var isAsNeeded: Bool
    var scheduledDoses: [MedicationDose]
    var asNeededDoses: [MedicationDose]
    
    var scheduledProgress: String {
        let taken = scheduledDoses.filter { $0.taken }.count
        let total = scheduledDoses.count
        return "\(taken)/\(total) taken"
    }
    
    var allScheduledTaken: Bool {
        return !scheduledDoses.isEmpty && scheduledDoses.allSatisfy { $0.taken }
    }
}

// MARK: - Todo Item
struct TodoItem: TrackableItem, Hashable {
    var id: String
    var date: Date
    var tags: [Tag]
    var notes: String?
    
    var title: String
    var completed: Bool
    var dueDate: Date?
    var priority: Priority
    
    enum Priority: String, Codable, CaseIterable {
        case low = "low"
        case medium = "medium"
        case high = "high"
        
        var color: String {
            switch self {
            case .low: return "#4CAF50" // Green
            case .medium: return "#FF9800" // Orange
            case .high: return "#F44336" // Red
            }
        }
    }
}

// MARK: - Calendar Event
struct CalendarEvent: TrackableItem, Hashable {
    var id: String
    var date: Date
    var tags: [Tag]
    var notes: String?
    
    var title: String
    var startTime: Date
    var endTime: Date
    var location: String?
    var allDay: Bool
}

// MARK: - View Configuration
struct ViewConfig: Identifiable, Codable, Hashable {
    var id: String
    var type: ViewType
    var title: String
    var visible: Bool
    var order: Int
    
    enum ViewType: String, Codable, CaseIterable {
        case sleep = "sleep"
        case screenTime = "screenTime"
        case medication = "medication"
        case todo = "todo"
        case calendar = "calendar"
    }
}