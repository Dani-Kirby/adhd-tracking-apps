import Foundation
import Combine

// MARK: - Data Store for all tracked items
class DataStore: ObservableObject {
    // Published properties to notify views of changes
    @Published var tags: [Tag] = []
    @Published var sleepEntries: [SleepEntry] = []
    @Published var screenTimeEntries: [ScreenTimeEntry] = []
    @Published var medicationEntries: [MedicationEntry] = []
    @Published var todoItems: [TodoItem] = []
    @Published var calendarEvents: [CalendarEvent] = []
    @Published var viewConfigs: [ViewConfig] = []
    @Published var screenTimeCategories: [String] = [
        "Social Media",
        "Entertainment",
        "Productivity",
        "Gaming",
        "Education",
        "Communication",
        "Other"
    ]
    
    // Keys for UserDefaults storage
    private enum StoreKey: String {
        case tags = "tags"
        case sleepEntries = "sleepEntries"
        case screenTimeEntries = "screenTimeEntries"
        case medicationEntries = "medicationEntries"
        case todoItems = "todoItems"
        case calendarEvents = "calendarEvents"
        case viewConfigs = "viewConfigs"
        case screenTimeCategories = "screenTimeCategories"
    }
    
    // Encoder and decoder for JSON serialization
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    
    // Initialize with stored data or defaults
    init() {
        loadData()
        
        // If no view configs exist, create default ones
        if viewConfigs.isEmpty {
            createDefaultViewConfigs()
        }
        
        // If no tags exist, create default ones
        if tags.isEmpty {
            createDefaultTags()
        }
    }
    
    // MARK: - Data Loading
    
    private func loadData() {
        tags = loadItems(forKey: .tags) ?? []
        sleepEntries = loadItems(forKey: .sleepEntries) ?? []
        screenTimeEntries = loadItems(forKey: .screenTimeEntries) ?? []
        medicationEntries = loadItems(forKey: .medicationEntries) ?? []
        todoItems = loadItems(forKey: .todoItems) ?? []
        calendarEvents = loadItems(forKey: .calendarEvents) ?? []
        viewConfigs = loadItems(forKey: .viewConfigs) ?? []
        screenTimeCategories = loadItems(forKey: .screenTimeCategories) ?? [
            "Social Media",
            "Entertainment",
            "Productivity",
            "Gaming",
            "Education",
            "Communication",
            "Other"
        ]
    }
    
    private func loadItems<T: Decodable>(forKey key: StoreKey) -> T? {
        guard let encryptedData = UserDefaults.standard.data(forKey: key.rawValue) else {
            return nil
        }
        
        do {
            return try SecurityManager.shared.decrypt(encryptedData)
        } catch {
            print("Error decoding \(key.rawValue): \(error)")
            return nil
        }
    }
    
    // MARK: - Data Saving
    
    private func saveItems<T: Encodable>(_ items: T, forKey key: StoreKey) {
        do {
            let encryptedData = try SecurityManager.shared.encrypt(items)
            UserDefaults.standard.set(encryptedData, forKey: key.rawValue)
        } catch {
            print("Error encoding \(key.rawValue): \(error)")
        }
    }
    
    // Save all data to UserDefaults
    private func saveAllData() {
        saveItems(tags, forKey: .tags)
        saveItems(sleepEntries, forKey: .sleepEntries)
        saveItems(screenTimeEntries, forKey: .screenTimeEntries)
        saveItems(medicationEntries, forKey: .medicationEntries)
        saveItems(todoItems, forKey: .todoItems)
        saveItems(calendarEvents, forKey: .calendarEvents)
        saveItems(viewConfigs, forKey: .viewConfigs)
        saveItems(screenTimeCategories, forKey: .screenTimeCategories)
    }
    
    // MARK: - Default Data Creation
    
    private func createDefaultViewConfigs() {
        viewConfigs = [
            ViewConfig(id: UUID().uuidString, type: .sleep, title: "Sleep Tracker", visible: true, order: 0),
            ViewConfig(id: UUID().uuidString, type: .screenTime, title: "Screen Time", visible: true, order: 1),
            ViewConfig(id: UUID().uuidString, type: .medication, title: "Medication", visible: true, order: 2),
            ViewConfig(id: UUID().uuidString, type: .todo, title: "To-Do List", visible: true, order: 3),
            ViewConfig(id: UUID().uuidString, type: .calendar, title: "Calendar", visible: true, order: 4)
        ]
        saveItems(viewConfigs, forKey: .viewConfigs)
    }
    
    private func createDefaultTags() {
        tags = [
            Tag(id: UUID().uuidString, name: "Important", color: "#F44336"),
            Tag(id: UUID().uuidString, name: "Work", color: "#2196F3"),
            Tag(id: UUID().uuidString, name: "Personal", color: "#4CAF50"),
            Tag(id: UUID().uuidString, name: "Health", color: "#FF9800")
        ]
        saveItems(tags, forKey: .tags)
    }
    
    // MARK: - Screen Time Category Management
    
    func addScreenTimeCategory(_ category: String) {
        if !screenTimeCategories.contains(category) {
            screenTimeCategories.append(category)
            saveItems(screenTimeCategories, forKey: .screenTimeCategories)
        }
    }
    
    func deleteScreenTimeCategory(_ category: String) {
        if category != "Other" {
            screenTimeCategories.removeAll { $0 == category }
            saveItems(screenTimeCategories, forKey: .screenTimeCategories)
        }
    }
    
    // MARK: - Tag Management
    
    func addTag(name: String) {
        let newTag = Tag(id: UUID().uuidString, name: name, color: Tag.generateRandomColor())
        tags.append(newTag)
        saveItems(tags, forKey: .tags)
    }
    
    func updateTag(_ tag: Tag) {
        if let index = tags.firstIndex(where: { $0.id == tag.id }) {
            tags[index] = tag
            saveItems(tags, forKey: .tags)
        }
    }
    
    func deleteTag(id: String) {
        tags.removeAll { $0.id == id }
        saveItems(tags, forKey: .tags)
    }
    
    // MARK: - Sleep Entry Management
    
    func addSleepEntry(_ entry: SleepEntry) {
        var newEntry = entry
        if newEntry.id.isEmpty {
            newEntry.id = UUID().uuidString
        }
        sleepEntries.append(newEntry)
        saveItems(sleepEntries, forKey: .sleepEntries)
    }
    
    func updateSleepEntry(_ entry: SleepEntry) {
        if let index = sleepEntries.firstIndex(where: { $0.id == entry.id }) {
            sleepEntries[index] = entry
            saveItems(sleepEntries, forKey: .sleepEntries)
        }
    }
    
    func deleteSleepEntry(id: String) {
        sleepEntries.removeAll { $0.id == id }
        saveItems(sleepEntries, forKey: .sleepEntries)
    }
    
    // MARK: - Screen Time Entry Management
    
    func addScreenTimeEntry(_ entry: ScreenTimeEntry) {
        var newEntry = entry
        if newEntry.id.isEmpty {
            newEntry.id = UUID().uuidString
        }
        screenTimeEntries.append(newEntry)
        saveItems(screenTimeEntries, forKey: .screenTimeEntries)
    }
    
    func updateScreenTimeEntry(_ entry: ScreenTimeEntry) {
        if let index = screenTimeEntries.firstIndex(where: { $0.id == entry.id }) {
            screenTimeEntries[index] = entry
            saveItems(screenTimeEntries, forKey: .screenTimeEntries)
        }
    }
    
    func deleteScreenTimeEntry(id: String) {
        screenTimeEntries.removeAll { $0.id == id }
        saveItems(screenTimeEntries, forKey: .screenTimeEntries)
    }
    
    // MARK: - Medication Entry Management
    
    func addMedicationEntry(_ entry: MedicationEntry) {
        var newEntry = entry
        if newEntry.id.isEmpty {
            newEntry.id = UUID().uuidString
        }
        medicationEntries.append(newEntry)
        saveItems(medicationEntries, forKey: .medicationEntries)
    }
    
    func updateMedicationEntry(_ entry: MedicationEntry) {
        if let index = medicationEntries.firstIndex(where: { $0.id == entry.id }) {
            medicationEntries[index] = entry
            saveItems(medicationEntries, forKey: .medicationEntries)
        }
    }
    
    func deleteMedicationEntry(id: String) {
        medicationEntries.removeAll { $0.id == id }
        saveItems(medicationEntries, forKey: .medicationEntries)
    }
    
    func addAsNeededDose(toMedicationWithId id: String, takenTime: Date = Date()) {
        if let index = medicationEntries.firstIndex(where: { $0.id == id }) {
            var entry = medicationEntries[index]
            let newDose = MedicationDose(scheduledTime: takenTime, takenTime: takenTime, taken: true)
            entry.asNeededDoses.append(newDose)
            medicationEntries[index] = entry
            saveItems(medicationEntries, forKey: .medicationEntries)
        }
    }
    
    func toggleScheduledDose(forMedicationWithId id: String, doseIndex: Int, takenTime: Date? = nil) {
        if let index = medicationEntries.firstIndex(where: { $0.id == id }), 
           doseIndex < medicationEntries[index].scheduledDoses.count {
            var entry = medicationEntries[index]
            entry.scheduledDoses[doseIndex].taken.toggle()
            entry.scheduledDoses[doseIndex].takenTime = entry.scheduledDoses[doseIndex].taken ? (takenTime ?? Date()) : nil
            medicationEntries[index] = entry
            saveItems(medicationEntries, forKey: .medicationEntries)
        }
    }
    
    // MARK: - Todo Item Management
    
    func addTodoItem(_ item: TodoItem) {
        var newItem = item
        if newItem.id.isEmpty {
            newItem.id = UUID().uuidString
        }
        todoItems.append(newItem)
        saveItems(todoItems, forKey: .todoItems)
    }
    
    func updateTodoItem(_ item: TodoItem) {
        if let index = todoItems.firstIndex(where: { $0.id == item.id }) {
            todoItems[index] = item
            saveItems(todoItems, forKey: .todoItems)
        }
    }
    
    func deleteTodoItem(id: String) {
        todoItems.removeAll { $0.id == id }
        saveItems(todoItems, forKey: .todoItems)
    }
    
    func toggleTodoCompletion(id: String) {
        if let index = todoItems.firstIndex(where: { $0.id == id }) {
            todoItems[index].completed.toggle()
            saveItems(todoItems, forKey: .todoItems)
        }
    }
    
    // MARK: - Calendar Event Management
    
    func addCalendarEvent(_ event: CalendarEvent) {
        var newEvent = event
        if newEvent.id.isEmpty {
            newEvent.id = UUID().uuidString
        }
        calendarEvents.append(newEvent)
        saveItems(calendarEvents, forKey: .calendarEvents)
    }
    
    func updateCalendarEvent(_ event: CalendarEvent) {
        if let index = calendarEvents.firstIndex(where: { $0.id == event.id }) {
            calendarEvents[index] = event
            saveItems(calendarEvents, forKey: .calendarEvents)
        }
    }
    
    func deleteCalendarEvent(id: String) {
        calendarEvents.removeAll { $0.id == id }
        saveItems(calendarEvents, forKey: .calendarEvents)
    }
    
    // MARK: - View Configuration Management
    
    func toggleViewVisibility(id: String) {
        if let index = viewConfigs.firstIndex(where: { $0.id == id }) {
            viewConfigs[index].visible.toggle()
            saveItems(viewConfigs, forKey: .viewConfigs)
        }
    }
    
    func updateViewOrder(orderedIds: [String]) {
        for (index, id) in orderedIds.enumerated() {
            if let viewIndex = viewConfigs.firstIndex(where: { $0.id == id }) {
                viewConfigs[viewIndex].order = index
            }
        }
        viewConfigs.sort { $0.order < $1.order }
        saveItems(viewConfigs, forKey: .viewConfigs)
    }
    
    // MARK: - Utility Methods
    
    func getItemsByTag<T: TrackableItem>(items: [T], tagId: String) -> [T] {
        return items.filter { item in
            item.tags.contains { $0.id == tagId }
        }
    }
    
    func getItemsByDate<T: TrackableItem>(items: [T], date: Date) -> [T] {
        let calendar = Calendar.current
        return items.filter { item in
            calendar.isDate(item.date, inSameDayAs: date)
        }
    }
}