import XCTest
@testable import ADHDTracker

class DataStoreTests: XCTestCase {
    var dataStore: DataStore!
    var userDefaultsSpy: UserDefaultsSpy!
    
    override func setUpWithError() throws {
        userDefaultsSpy = UserDefaultsSpy()
        dataStore = DataStore()
        // Replace the real UserDefaults with our spy
        replaceUserDefaults(userDefaultsSpy)
    }
    
    override func tearDownWithError() throws {
        // Restore original UserDefaults
        restoreUserDefaults()
        dataStore = nil
        userDefaultsSpy = nil
    }
    
    // MARK: - Helper Functions
    
    func replaceUserDefaults(_ mock: UserDefaultsSpy) {
        // This would be implemented to replace the UserDefaults standard instance
        // with our test spy - exact implementation depends on app architecture
    }
    
    func restoreUserDefaults() {
        // This would restore the original UserDefaults
    }
    
    // MARK: - Tag Management Tests
    
    func testAddTag() {
        // Given
        let initialTagCount = dataStore.tags.count
        let tagName = "Test Tag"
        
        // When
        dataStore.addTag(name: tagName)
        
        // Then
        XCTAssertEqual(dataStore.tags.count, initialTagCount + 1, "Tag count should increase by 1")
        XCTAssertEqual(dataStore.tags.last?.name, tagName, "The last tag should have the provided name")
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the tag")
    }
    
    func testUpdateTag() {
        // Given
        let tag = Tag(id: "test-id", name: "Original Name", color: "#FF0000")
        dataStore.tags.append(tag)
        let updatedTag = Tag(id: tag.id, name: "Updated Name", color: "#00FF00")
        
        // When
        dataStore.updateTag(updatedTag)
        
        // Then
        if let index = dataStore.tags.firstIndex(where: { $0.id == tag.id }) {
            XCTAssertEqual(dataStore.tags[index].name, "Updated Name", "Tag name should be updated")
            XCTAssertEqual(dataStore.tags[index].color, "#00FF00", "Tag color should be updated")
        } else {
            XCTFail("Updated tag should exist in the dataStore")
        }
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the updated tag")
    }
    
    func testDeleteTag() {
        // Given
        let tag = Tag(id: "test-id", name: "Test Tag", color: "#FF0000")
        dataStore.tags.append(tag)
        let initialTagCount = dataStore.tags.count
        
        // When
        dataStore.deleteTag(id: tag.id)
        
        // Then
        XCTAssertEqual(dataStore.tags.count, initialTagCount - 1, "Tag count should decrease by 1")
        XCTAssertNil(dataStore.tags.first(where: { $0.id == tag.id }), "Tag should be removed")
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the updated tags")
    }
    
    // MARK: - Sleep Entry Tests
    
    func testAddSleepEntry() {
        // Given
        let initialCount = dataStore.sleepEntries.count
        let startTime = Date().addingTimeInterval(-28800) // 8 hours ago
        let endTime = Date()
        let sleepEntry = SleepEntry(
            id: "",
            date: Date(),
            tags: [],
            notes: nil,
            startTime: startTime,
            endTime: endTime,
            quality: 4
        )
        
        // When
        dataStore.addSleepEntry(sleepEntry)
        
        // Then
        XCTAssertEqual(dataStore.sleepEntries.count, initialCount + 1, "Sleep entry count should increase by 1")
        XCTAssertFalse(dataStore.sleepEntries.last?.id.isEmpty ?? true, "ID should be generated")
        XCTAssertEqual(dataStore.sleepEntries.last?.quality, 4, "Quality should match")
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the entry")
    }
    
    func testUpdateSleepEntry() {
        // Given
        let entry = SleepEntry(
            id: "test-id",
            date: Date(),
            tags: [],
            notes: nil,
            startTime: Date().addingTimeInterval(-28800),
            endTime: Date(),
            quality: 3
        )
        dataStore.sleepEntries.append(entry)
        
        var updatedEntry = entry
        updatedEntry.quality = 5
        
        // When
        dataStore.updateSleepEntry(updatedEntry)
        
        // Then
        if let index = dataStore.sleepEntries.firstIndex(where: { $0.id == entry.id }) {
            XCTAssertEqual(dataStore.sleepEntries[index].quality, 5, "Sleep quality should be updated")
        } else {
            XCTFail("Updated entry should exist in the dataStore")
        }
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the updated entry")
    }
    
    func testDeleteSleepEntry() {
        // Given
        let entry = SleepEntry(
            id: "test-id",
            date: Date(),
            tags: [],
            notes: nil,
            startTime: Date().addingTimeInterval(-28800),
            endTime: Date(),
            quality: 3
        )
        dataStore.sleepEntries.append(entry)
        let initialCount = dataStore.sleepEntries.count
        
        // When
        dataStore.deleteSleepEntry(id: entry.id)
        
        // Then
        XCTAssertEqual(dataStore.sleepEntries.count, initialCount - 1, "Sleep entry count should decrease by 1")
        XCTAssertNil(dataStore.sleepEntries.first(where: { $0.id == entry.id }), "Entry should be removed")
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the updated entries")
    }
    
    // MARK: - Medication Entry Tests
    
    func testAddMedicationEntry() {
        // Given
        let initialCount = dataStore.medicationEntries.count
        let medicationEntry = MedicationEntry(
            id: "",
            date: Date(),
            tags: [],
            notes: nil,
            medication: "Test Medication",
            dosage: "10mg",
            isAsNeeded: false,
            scheduledDoses: [
                MedicationDose(scheduledTime: Date(), takenTime: nil, taken: false)
            ],
            asNeededDoses: []
        )
        
        // When
        dataStore.addMedicationEntry(medicationEntry)
        
        // Then
        XCTAssertEqual(dataStore.medicationEntries.count, initialCount + 1, "Medication entry count should increase by 1")
        XCTAssertFalse(dataStore.medicationEntries.last?.id.isEmpty ?? true, "ID should be generated")
        XCTAssertEqual(dataStore.medicationEntries.last?.medication, "Test Medication", "Medication name should match")
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the entry")
    }
    
    func testToggleScheduledDose() {
        // Given
        let dose = MedicationDose(scheduledTime: Date(), takenTime: nil, taken: false)
        let entry = MedicationEntry(
            id: "test-id",
            date: Date(),
            tags: [],
            notes: nil,
            medication: "Test Medication",
            dosage: "10mg",
            isAsNeeded: false,
            scheduledDoses: [dose],
            asNeededDoses: []
        )
        dataStore.medicationEntries.append(entry)
        
        // When
        dataStore.toggleScheduledDose(forMedicationWithId: entry.id, doseIndex: 0)
        
        // Then
        if let index = dataStore.medicationEntries.firstIndex(where: { $0.id == entry.id }) {
            XCTAssertTrue(dataStore.medicationEntries[index].scheduledDoses[0].taken, "Dose should be marked as taken")
            XCTAssertNotNil(dataStore.medicationEntries[index].scheduledDoses[0].takenTime, "Taken time should be set")
        } else {
            XCTFail("Entry should exist in the dataStore")
        }
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the updated entry")
    }
    
    // MARK: - Todo Item Tests
    
    func testAddTodoItem() {
        // Given
        let initialCount = dataStore.todoItems.count
        let todoItem = TodoItem(
            id: "",
            date: Date(),
            tags: [],
            notes: nil,
            title: "Test Todo",
            completed: false,
            dueDate: Date().addingTimeInterval(86400),
            priority: .medium
        )
        
        // When
        dataStore.addTodoItem(todoItem)
        
        // Then
        XCTAssertEqual(dataStore.todoItems.count, initialCount + 1, "Todo item count should increase by 1")
        XCTAssertFalse(dataStore.todoItems.last?.id.isEmpty ?? true, "ID should be generated")
        XCTAssertEqual(dataStore.todoItems.last?.title, "Test Todo", "Todo title should match")
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the item")
    }
    
    func testToggleTodoCompletion() {
        // Given
        let item = TodoItem(
            id: "test-id",
            date: Date(),
            tags: [],
            notes: nil,
            title: "Test Todo",
            completed: false,
            dueDate: nil,
            priority: .medium
        )
        dataStore.todoItems.append(item)
        
        // When
        dataStore.toggleTodoCompletion(id: item.id)
        
        // Then
        if let index = dataStore.todoItems.firstIndex(where: { $0.id == item.id }) {
            XCTAssertTrue(dataStore.todoItems[index].completed, "Todo should be marked as completed")
        } else {
            XCTFail("Todo item should exist in the dataStore")
        }
        XCTAssertTrue(userDefaultsSpy.setItemCalled, "UserDefaults should be called to save the updated item")
    }
    
    // MARK: - Utility Method Tests
    
    func testGetItemsByTag() {
        // Given
        let tag1 = Tag(id: "tag1", name: "Tag 1", color: "#FF0000")
        let tag2 = Tag(id: "tag2", name: "Tag 2", color: "#00FF00")
        
        let item1 = TodoItem(
            id: "item1",
            date: Date(),
            tags: [tag1],
            notes: nil,
            title: "Item with tag1",
            completed: false,
            dueDate: nil,
            priority: .medium
        )
        
        let item2 = TodoItem(
            id: "item2",
            date: Date(),
            tags: [tag2],
            notes: nil,
            title: "Item with tag2",
            completed: false,
            dueDate: nil,
            priority: .medium
        )
        
        let item3 = TodoItem(
            id: "item3",
            date: Date(),
            tags: [tag1, tag2],
            notes: nil,
            title: "Item with both tags",
            completed: false,
            dueDate: nil,
            priority: .medium
        )
        
        dataStore.todoItems = [item1, item2, item3]
        
        // When
        let itemsWithTag1 = dataStore.getItemsByTag(items: dataStore.todoItems, tagId: "tag1")
        
        // Then
        XCTAssertEqual(itemsWithTag1.count, 2, "Should find 2 items with tag1")
        XCTAssertTrue(itemsWithTag1.contains { $0.id == "item1" }, "Should include item1")
        XCTAssertTrue(itemsWithTag1.contains { $0.id == "item3" }, "Should include item3")
        XCTAssertFalse(itemsWithTag1.contains { $0.id == "item2" }, "Should not include item2")
    }
    
    func testGetItemsByDate() {
        // Given
        let today = Date()
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: today)!
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!
        
        let item1 = TodoItem(
            id: "item1",
            date: today,
            tags: [],
            notes: nil,
            title: "Today's item",
            completed: false,
            dueDate: nil,
            priority: .medium
        )
        
        let item2 = TodoItem(
            id: "item2",
            date: yesterday,
            tags: [],
            notes: nil,
            title: "Yesterday's item",
            completed: false,
            dueDate: nil,
            priority: .medium
        )
        
        let item3 = TodoItem(
            id: "item3",
            date: today,
            tags: [],
            notes: nil,
            title: "Another today's item",
            completed: false,
            dueDate: nil,
            priority: .medium
        )
        
        dataStore.todoItems = [item1, item2, item3]
        
        // When
        let todayItems = dataStore.getItemsByDate(items: dataStore.todoItems, date: today)
        
        // Then
        XCTAssertEqual(todayItems.count, 2, "Should find 2 items for today")
        XCTAssertTrue(todayItems.contains { $0.id == "item1" }, "Should include item1")
        XCTAssertTrue(todayItems.contains { $0.id == "item3" }, "Should include item3")
        XCTAssertFalse(todayItems.contains { $0.id == "item2" }, "Should not include item2")
    }
}

// MARK: - User Defaults Spy

class UserDefaultsSpy: UserDefaults {
    var setItemCalled = false
    var getItemCalled = false
    var removeItemCalled = false
    private var storage: [String: Any] = [:]
    
    override func set(_ value: Any?, forKey defaultName: String) {
        setItemCalled = true
        storage[defaultName] = value
    }
    
    override func object(forKey defaultName: String) -> Any? {
        getItemCalled = true
        return storage[defaultName]
    }
    
    override func removeObject(forKey defaultName: String) {
        removeItemCalled = true
        storage.removeKey(defaultName)
    }
}