import XCTest
import SwiftUI
import ViewInspector
@testable import ADHDTracker

class SleepTrackerViewTests: XCTestCase {
    
    var dataStore: DataStore!
    
    override func setUpWithError() throws {
        dataStore = DataStore()
        // Clear any existing data for clean tests
        dataStore.sleepEntries = []
    }
    
    override func tearDownWithError() throws {
        dataStore = nil
    }
    
    // MARK: - Helper Extensions for Testing SwiftUI Views
    
    // ViewInspector requires Inspectable conformance for SwiftUI views
    extension SleepTrackerView: Inspectable {}
    
    // MARK: - UI Rendering Tests
    
    func testEmptyStateRendering() throws {
        // Given
        let view = SleepTrackerView()
            .environmentObject(dataStore)
        
        // When/Then
        // Extract the main VStack
        let vStack = try view.inspect().vStack()
        
        // When data is empty, should show empty state message
        let emptyText = try vStack.find(text: "No sleep data recorded yet.")
        XCTAssertNotNil(emptyText, "Empty state message should be displayed")
        
        // Should have an "Add Sleep Entry" button
        let addButton = try vStack.find(button: "Add Sleep Entry")
        XCTAssertNotNil(addButton, "Add button should be displayed in empty state")
    }
    
    func testEntryFormRendering() throws {
        // Given
        let view = SleepTrackerView()
            .environmentObject(dataStore)
        
        // When
        // Show the add form
        let addButton = try view.inspect().vStack().find(button: "Add Sleep Entry")
        try addButton.tap()
        
        // Then
        // Form should be displayed with all required inputs
        let form = try view.inspect().vStack().vStack(1)
        
        // Check for form title
        let formTitle = try form.find(text: "Add Sleep Entry")
        XCTAssertNotNil(formTitle, "Form title should be displayed")
        
        // Check for input fields
        let sleepTimeField = try form.find(viewWithId: "sleep-time-input")
        XCTAssertNotNil(sleepTimeField, "Sleep time input should be displayed")
        
        let wakeTimeField = try form.find(viewWithId: "wake-time-input")
        XCTAssertNotNil(wakeTimeField, "Wake time input should be displayed")
        
        let qualityRating = try form.find(viewWithId: "quality-rating")
        XCTAssertNotNil(qualityRating, "Quality rating should be displayed")
        
        // Check for buttons
        let cancelButton = try form.find(button: "Cancel")
        XCTAssertNotNil(cancelButton, "Cancel button should be displayed")
        
        let saveButton = try form.find(button: "Save")
        XCTAssertNotNil(saveButton, "Save button should be displayed")
    }
    
    func testEntriesListRendering() throws {
        // Given
        // Add test entries to the data store
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date())!
        let testEntry = SleepEntry(
            id: UUID().uuidString,
            date: Date(),
            tags: [],
            notes: nil,
            startTime: yesterday,
            endTime: Date(),
            quality: 4
        )
        dataStore.sleepEntries = [testEntry]
        
        let view = SleepTrackerView()
            .environmentObject(dataStore)
        
        // When/Then
        // Should show the entries list
        let entriesList = try view.inspect().vStack().scrollView()
        XCTAssertNotNil(entriesList, "Entries list should be displayed")
        
        // Should show the entry details
        let entryCard = try entriesList.vStack().vStack(0)
        
        // Check for duration
        let durationText = try entryCard.find(text: "8.0 hours") // Assuming ~8 hour difference
        XCTAssertNotNil(durationText, "Duration should be displayed")
        
        // Check for quality stars
        let qualityRating = try entryCard.find(viewWithId: "entry-quality-rating")
        XCTAssertNotNil(qualityRating, "Quality rating should be displayed")
        
        // Check for action buttons
        let editButton = try entryCard.find(button: "Edit")
        XCTAssertNotNil(editButton, "Edit button should be displayed")
        
        let deleteButton = try entryCard.find(button: "Delete")
        XCTAssertNotNil(deleteButton, "Delete button should be displayed")
    }
    
    // MARK: - Interaction Tests
    
    func testAddNewSleepEntry() throws {
        // Given
        let view = SleepTrackerView()
            .environmentObject(dataStore)
        
        // When
        // Show the add form
        let addButton = try view.inspect().vStack().find(button: "Add Sleep Entry")
        try addButton.tap()
        
        // Fill out the form
        let form = try view.inspect().vStack().vStack(1)
        
        let sleepTimeField = try form.find(viewWithId: "sleep-time-input") as! DatePicker
        try sleepTimeField.setDate(Date().addingTimeInterval(-28800)) // 8 hours ago
        
        let wakeTimeField = try form.find(viewWithId: "wake-time-input") as! DatePicker
        try wakeTimeField.setDate(Date())
        
        let qualityRating = try form.find(viewWithId: "quality-rating") as! Picker<Int>
        try qualityRating.select(value: 4)
        
        // Submit the form
        let saveButton = try form.find(button: "Save")
        try saveButton.tap()
        
        // Then
        XCTAssertEqual(dataStore.sleepEntries.count, 1, "A new sleep entry should be added")
        XCTAssertEqual(dataStore.sleepEntries[0].quality, 4, "Quality should match the input")
        XCTAssertEqual(dataStore.sleepEntries[0].durationInHours, 8.0, "Duration should be calculated correctly")
    }
    
    func testEditSleepEntry() throws {
        // Given
        // Add a test entry
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date())!
        let testEntry = SleepEntry(
            id: UUID().uuidString,
            date: Date(),
            tags: [],
            notes: nil,
            startTime: yesterday,
            endTime: Date(),
            quality: 3
        )
        dataStore.sleepEntries = [testEntry]
        
        let view = SleepTrackerView()
            .environmentObject(dataStore)
        
        // When
        // Click edit button
        let entryCard = try view.inspect().vStack().scrollView().vStack().vStack(0)
        let editButton = try entryCard.find(button: "Edit")
        try editButton.tap()
        
        // Form should be in edit mode
        let form = try view.inspect().vStack().vStack(1)
        let formTitle = try form.find(text: "Edit Sleep Entry")
        XCTAssertNotNil(formTitle, "Form should be in edit mode")
        
        // Change quality rating
        let qualityRating = try form.find(viewWithId: "quality-rating") as! Picker<Int>
        try qualityRating.select(value: 5)
        
        // Submit the form
        let updateButton = try form.find(button: "Update")
        try updateButton.tap()
        
        // Then
        XCTAssertEqual(dataStore.sleepEntries.count, 1, "Entry count should remain the same")
        XCTAssertEqual(dataStore.sleepEntries[0].quality, 5, "Quality should be updated")
    }
    
    func testDeleteSleepEntry() throws {
        // Given
        // Add a test entry
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date())!
        let testEntry = SleepEntry(
            id: UUID().uuidString,
            date: Date(),
            tags: [],
            notes: nil,
            startTime: yesterday,
            endTime: Date(),
            quality: 3
        )
        dataStore.sleepEntries = [testEntry]
        
        let view = SleepTrackerView()
            .environmentObject(dataStore)
        
        // When
        // Click delete button
        let entryCard = try view.inspect().vStack().scrollView().vStack().vStack(0)
        let deleteButton = try entryCard.find(button: "Delete")
        try deleteButton.tap()
        
        // Confirm deletion in dialog
        let confirmDialog = try view.inspect().find(viewWithId: "confirm-dialog")
        let confirmButton = try confirmDialog.find(button: "Confirm")
        try confirmButton.tap()
        
        // Then
        XCTAssertEqual(dataStore.sleepEntries.count, 0, "Entry should be deleted")
    }
    
    // MARK: - Validation Tests
    
    func testFormValidation() throws {
        // Given
        let view = SleepTrackerView()
            .environmentObject(dataStore)
        
        // When
        // Show the add form
        let addButton = try view.inspect().vStack().find(button: "Add Sleep Entry")
        try addButton.tap()
        
        // Submit without filling the form
        let form = try view.inspect().vStack().vStack(1)
        let saveButton = try form.find(button: "Save")
        
        // Then
        // Button should be disabled
        XCTAssertFalse(try saveButton.isEnabled(), "Save button should be disabled when form is invalid")
        
        // Fill only some fields
        let sleepTimeField = try form.find(viewWithId: "sleep-time-input") as! DatePicker
        try sleepTimeField.setDate(Date().addingTimeInterval(-28800))
        
        // Button should still be disabled
        XCTAssertFalse(try saveButton.isEnabled(), "Save button should be disabled when form is partially filled")
    }
    
    func testTagFiltering() throws {
        // Given
        // Create tags
        let tag1 = Tag(id: UUID().uuidString, name: "Good Sleep", color: "#4CAF50")
        let tag2 = Tag(id: UUID().uuidString, name: "Bad Sleep", color: "#F44336")
        
        // Add entries with different tags
        let entry1 = SleepEntry(
            id: UUID().uuidString,
            date: Date(),
            tags: [tag1],
            notes: nil,
            startTime: Date().addingTimeInterval(-28800),
            endTime: Date(),
            quality: 4
        )
        
        let entry2 = SleepEntry(
            id: UUID().uuidString,
            date: Date(),
            tags: [tag2],
            notes: nil,
            startTime: Date().addingTimeInterval(-28800),
            endTime: Date(),
            quality: 2
        )
        
        dataStore.sleepEntries = [entry1, entry2]
        dataStore.tags = [tag1, tag2]
        
        let view = SleepTrackerView()
            .environmentObject(dataStore)
        
        // When
        // Select tag filter
        let tagFilter = try view.inspect().vStack().find(viewWithId: "tag-filter") as! Picker<String>
        try tagFilter.select(value: tag1.id)
        
        // Then
        // Only entries with tag1 should be visible
        let entriesList = try view.inspect().vStack().scrollView()
        let visibleEntries = try entriesList.vStack().vStack().count
        
        XCTAssertEqual(visibleEntries, 1, "Only one entry should be visible after filtering")
    }
}

// MARK: - ViewInspector Helper for SwiftUI Testing

// Note: In a real project, you would need to include the ViewInspector package
// and implement these extensions to make SwiftUI views testable
// This code is for demonstration purposes only

// Stub implementation of ViewInspector functionality
enum ViewInspector {
    // Core protocols and methods would be defined here
}

protocol Inspectable {
    // Methods for inspection would be defined here
}

extension View {
    func inspect() -> InspectableView<ViewType.View> {
        fatalError("This is a stub implementation")
    }
}

struct InspectableView<T> {
    func vStack() -> InspectableView<ViewType.VStack> {
        fatalError("This is a stub implementation")
    }
    
    func vStack(_ index: Int) -> InspectableView<ViewType.VStack> {
        fatalError("This is a stub implementation")
    }
    
    func scrollView() -> InspectableView<ViewType.ScrollView> {
        fatalError("This is a stub implementation")
    }
    
    func find<V>(viewWithId id: String) -> V {
        fatalError("This is a stub implementation")
    }
    
    func find(text: String) -> InspectableView<ViewType.Text> {
        fatalError("This is a stub implementation")
    }
    
    func find(button: String) -> InspectableView<ViewType.Button> {
        fatalError("This is a stub implementation")
    }
}

struct ViewType {
    struct View {}
    struct VStack {}
    struct ScrollView {}
    struct Text {}
    struct Button {
        func tap() throws {}
        func isEnabled() throws -> Bool { fatalError("Stub implementation") }
    }
}

extension DatePicker {
    func setDate(_ date: Date) throws {}
}

extension Picker {
    func select(value: SelectionValue) throws {}
}