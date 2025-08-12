import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var editMode = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Display only visible views, sorted by order
                ForEach(dataStore.viewConfigs.filter { $0.visible }.sorted(by: { $0.order < $1.order })) { viewConfig in
                    viewCard(for: viewConfig)
                }
                
                // Edit views button
                Button(action: {
                    editMode.toggle()
                }) {
                    Label(editMode ? "Done" : "Edit Views", systemImage: editMode ? "checkmark" : "pencil")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                }
                .buttonStyle(.bordered)
                .padding(.horizontal)
            }
            .padding(.top)
        }
        .sheet(isPresented: $editMode) {
            ViewConfigurationSheet()
        }
    }
    
    @ViewBuilder
    func viewCard(for viewConfig: ViewConfig) -> some View {
        VStack(alignment: .leading) {
            // Header with view title and menu
            HStack {
                Text(viewConfig.title)
                    .font(.headline)
                
                Spacer()
                
                Menu {
                    Button(action: {
                        // Action to add entry for this view type
                    }) {
                        Label("Add Entry", systemImage: "plus")
                    }
                    
                    Button(action: {
                        dataStore.toggleViewVisibility(id: viewConfig.id)
                    }) {
                        Label("Hide View", systemImage: "eye.slash")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .padding(8)
                }
            }
            .padding(.horizontal)
            .padding(.top, 8)
            
            // View content based on type
            switch viewConfig.type {
            case .sleep:
                SleepTrackerCard()
                
            case .screenTime:
                ScreenTimeTrackerCard()
                
            case .medication:
                MedicationTrackerCard()
                
            case .todo:
                TodoListCard()
                
            case .calendar:
                CalendarCard()
            }
        }
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
        .padding(.horizontal)
    }
}

// View configuration sheet for reordering and toggling views
struct ViewConfigurationSheet: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var viewConfigs: [ViewConfig] = []
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            List {
                ForEach(viewConfigs) { viewConfig in
                    HStack {
                        Image(systemName: viewTypeIcon(for: viewConfig.type))
                            .foregroundColor(.blue)
                        
                        Text(viewConfig.title)
                        
                        Spacer()
                        
                        Toggle("", isOn: Binding(
                            get: { viewConfig.visible },
                            set: { newValue in
                                if let index = viewConfigs.firstIndex(where: { $0.id == viewConfig.id }) {
                                    viewConfigs[index].visible = newValue
                                }
                            }
                        ))
                    }
                }
                .onMove { indices, newOffset in
                    viewConfigs.move(fromOffsets: indices, toOffset: newOffset)
                }
            }
            .navigationTitle("Configure Views")
            .navigationBarItems(
                trailing: Button("Save") {
                    // Save changes back to dataStore
                    for (index, config) in viewConfigs.enumerated() {
                        if let storeIndex = dataStore.viewConfigs.firstIndex(where: { $0.id == config.id }) {
                            dataStore.viewConfigs[storeIndex].visible = config.visible
                            dataStore.viewConfigs[storeIndex].order = index
                        }
                    }
                    
                    // Save order in dataStore
                    dataStore.updateViewOrder(orderedIds: viewConfigs.map { $0.id })
                    
                    presentationMode.wrappedValue.dismiss()
                }
            )
            .environment(\.editMode, .constant(.active))
        }
        .onAppear {
            // Initialize with current view configs
            viewConfigs = dataStore.viewConfigs.sorted(by: { $0.order < $1.order })
        }
    }
    
    func viewTypeIcon(for type: ViewConfig.ViewType) -> String {
        switch type {
        case .sleep:
            return "bed.double"
        case .screenTime:
            return "iphone"
        case .medication:
            return "pill"
        case .todo:
            return "checklist"
        case .calendar:
            return "calendar"
        }
    }
}

// MARK: - Card Views

struct SleepTrackerCard: View {
    @EnvironmentObject var dataStore: DataStore
    
    var body: some View {
        VStack(alignment: .center) {
            if dataStore.sleepEntries.isEmpty {
                Text("No sleep data recorded yet.")
                    .padding()
                
                Button("ADD SLEEP ENTRY") {
                    // Navigate to sleep entry form
                }
                .buttonStyle(.borderedProminent)
                .padding(.bottom)
            } else {
                // Show the most recent sleep entries
                ForEach(Array(dataStore.sleepEntries.sorted(by: { $0.date > $1.date }).prefix(3))) { entry in
                    SleepEntryRow(entry: entry)
                }
                
                Button("View All") {
                    // Navigate to full sleep list
                }
                .padding(.vertical, 8)
            }
        }
    }
}

struct SleepEntryRow: View {
    let entry: SleepEntry
    @EnvironmentObject var dataStore: DataStore
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(formatDate(entry.date))
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text("\(formatTime(entry.startTime)) - \(formatTime(entry.endTime))")
                    .font(.body)
                
                Text("Duration: \(String(format: "%.1f", entry.durationInHours)) hours")
                    .font(.caption)
            }
            
            Spacer()
            
            // Quality stars
            HStack {
                ForEach(1...5, id: \.self) { star in
                    Image(systemName: star <= entry.quality ? "star.fill" : "star")
                        .foregroundColor(.yellow)
                        .font(.caption)
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
    
    func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
    
    func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .none
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct ScreenTimeTrackerCard: View {
    @EnvironmentObject var dataStore: DataStore
    
    var body: some View {
        VStack(alignment: .center) {
            if dataStore.screenTimeEntries.isEmpty {
                Text("No screen time data recorded yet.")
                    .padding()
                
                Button("ADD SCREEN TIME") {
                    // Navigate to screen time entry form
                }
                .buttonStyle(.borderedProminent)
                .padding(.bottom)
            } else {
                // Show the most recent screen time entries
                ForEach(Array(dataStore.screenTimeEntries.sorted(by: { $0.date > $1.date }).prefix(3))) { entry in
                    ScreenTimeEntryRow(entry: entry)
                }
                
                Button("View All") {
                    // Navigate to full screen time list
                }
                .padding(.vertical, 8)
            }
        }
    }
}

struct ScreenTimeEntryRow: View {
    let entry: ScreenTimeEntry
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(formatDate(entry.date))
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(entry.application)
                    .font(.body)
                
                if let category = entry.category {
                    Text(category)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            Text(entry.formattedDuration)
                .font(.body)
                .fontWeight(.medium)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
    
    func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
}

struct MedicationTrackerCard: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var showingAddForm = false
    
    var body: some View {
        VStack(alignment: .center) {
            if dataStore.medicationEntries.isEmpty && !showingAddForm {
                Text("No medications tracked yet.")
                    .padding()
                
                Button("ADD MEDICATION") {
                    showingAddForm = true
                }
                .buttonStyle(.borderedProminent)
                .padding(.bottom)
            } else {
                if showingAddForm {
                    MedicationEntryForm(isPresented: $showingAddForm)
                        .padding()
                } else {
                    // Show today's medications
                    ForEach(todaysMedications()) { entry in
                        MedicationEntryRow(entry: entry)
                    }
                    
                    Button("View All") {
                        // Navigate to full medication list
                    }
                    .padding(.vertical, 8)
                }
            }
        }
    }
    
    func todaysMedications() -> [MedicationEntry] {
        let calendar = Calendar.current
        return dataStore.medicationEntries.filter { entry in
            calendar.isDateInToday(entry.date)
        }.sorted { $0.medication < $1.medication }
    }
}

struct MedicationEntryRow: View {
    let entry: MedicationEntry
    @EnvironmentObject var dataStore: DataStore
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                VStack(alignment: .leading) {
                    Text(entry.medication)
                        .font(.headline)
                    
                    Text(entry.dosage)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // Type indicator
                HStack {
                    Image(systemName: entry.isAsNeeded ? "pills" : "clock")
                    Text(entry.isAsNeeded ? "As Needed" : entry.scheduledProgress)
                }
                .font(.caption)
                .padding(4)
                .background(
                    RoundedRectangle(cornerRadius: 4)
                        .fill(entry.isAsNeeded ? Color.blue.opacity(0.2) : 
                              entry.allScheduledTaken ? Color.green.opacity(0.2) : Color.primary.opacity(0.1))
                )
            }
            .padding(.horizontal)
            .padding(.top, 8)
            
            Divider()
                .padding(.horizontal)
            
            // Scheduled doses or as-needed button
            if entry.isAsNeeded {
                Button(action: {
                    dataStore.addAsNeededDose(toMedicationWithId: entry.id)
                }) {
                    Label("Take Dose", systemImage: "plus.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderless)
                .padding(.vertical, 4)
                .padding(.horizontal)
            } else {
                // Scheduled doses
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(Array(entry.scheduledDoses.enumerated()), id: \.element.time) { index, dose in
                            Button(action: {
                                dataStore.toggleScheduledDose(forMedicationWithId: entry.id, doseIndex: index)
                            }) {
                                HStack {
                                    Text(formatTime(dose.time))
                                        .font(.caption)
                                    
                                    Image(systemName: dose.taken ? "checkmark.circle.fill" : "circle")
                                        .foregroundColor(dose.taken ? .green : .gray)
                                }
                                .padding(6)
                                .background(
                                    RoundedRectangle(cornerRadius: 6)
                                        .stroke(Color.gray.opacity(0.2))
                                        .background(dose.taken ? Color.green.opacity(0.1) : Color.clear)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 8)
                }
            }
        }
        .background(Color(.secondarySystemBackground))
        .cornerRadius(8)
        .padding(.horizontal)
    }
    
    func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .none
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct MedicationEntryForm: View {
    @EnvironmentObject var dataStore: DataStore
    @Binding var isPresented: Bool
    
    @State private var medication = ""
    @State private var dosage = ""
    @State private var isAsNeeded = false
    @State private var scheduledDoses: [MedicationDose] = [MedicationDose(time: Date(), taken: false)]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Add Medication")
                .font(.headline)
            
            TextField("Medication Name", text: $medication)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            TextField("Dosage", text: $dosage)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            Toggle("As-needed medication (PRN)", isOn: $isAsNeeded)
            
            if !isAsNeeded {
                Text("Scheduled Times")
                    .font(.subheadline)
                
                ForEach(Array(scheduledDoses.enumerated()), id: \.offset) { index, dose in
                    HStack {
                        DatePicker("", selection: Binding(
                            get: { self.scheduledDoses[index].time },
                            set: { self.scheduledDoses[index].time = $0 }
                        ), displayedComponents: .hourAndMinute)
                        
                        if scheduledDoses.count > 1 {
                            Button(action: {
                                scheduledDoses.remove(at: index)
                            }) {
                                Image(systemName: "minus.circle.fill")
                                    .foregroundColor(.red)
                            }
                        }
                    }
                }
                
                Button(action: {
                    scheduledDoses.append(MedicationDose(time: Date(), taken: false))
                }) {
                    Label("Add Another Time", systemImage: "plus.circle")
                }
                .padding(.top, 4)
            }
            
            HStack {
                Button("Cancel") {
                    isPresented = false
                }
                
                Spacer()
                
                Button("Save") {
                    let newEntry = MedicationEntry(
                        id: UUID().uuidString,
                        date: Date(),
                        tags: [],
                        notes: nil,
                        medication: medication,
                        dosage: dosage,
                        isAsNeeded: isAsNeeded,
                        scheduledDoses: isAsNeeded ? [] : scheduledDoses,
                        asNeededDoses: []
                    )
                    
                    dataStore.addMedicationEntry(newEntry)
                    isPresented = false
                }
                .disabled(medication.isEmpty || dosage.isEmpty || 
                          (!isAsNeeded && scheduledDoses.isEmpty))
            }
            .padding(.top)
        }
    }
}

struct TodoListCard: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var newTaskTitle = ""
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("To-Do List")
                .font(.headline)
                .padding(.horizontal)
                .padding(.top, 8)
            
            // Quick add task
            HStack {
                TextField("Add a task...", text: $newTaskTitle)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Button(action: {
                    addTask()
                }) {
                    Image(systemName: "plus")
                }
                .disabled(newTaskTitle.isEmpty)
            }
            .padding(.horizontal)
            
            if dataStore.todoItems.isEmpty {
                Text("No to-do items yet. Add some tasks to get started!")
                    .padding()
                    .foregroundColor(.secondary)
            } else {
                List {
                    ForEach(pendingTasks()) { item in
                        TodoItemRow(item: item)
                    }
                    .onDelete(perform: deleteTasks)
                }
                .listStyle(PlainListStyle())
                .frame(height: min(CGFloat(pendingTasks().count * 50), 200))
            }
        }
    }
    
    func pendingTasks() -> [TodoItem] {
        return dataStore.todoItems
            .filter { !$0.completed }
            .sorted { 
                if $0.priority == $1.priority {
                    return $0.date < $1.date
                }
                return $0.priority.rawValue > $1.priority.rawValue
            }
    }
    
    func addTask() {
        guard !newTaskTitle.isEmpty else { return }
        
        let newTask = TodoItem(
            id: UUID().uuidString,
            date: Date(),
            tags: [],
            notes: nil,
            title: newTaskTitle,
            completed: false,
            dueDate: nil,
            priority: .medium
        )
        
        dataStore.addTodoItem(newTask)
        newTaskTitle = ""
    }
    
    func deleteTasks(at offsets: IndexSet) {
        let tasks = pendingTasks()
        offsets.forEach { index in
            dataStore.deleteTodoItem(id: tasks[index].id)
        }
    }
}

struct TodoItemRow: View {
    let item: TodoItem
    @EnvironmentObject var dataStore: DataStore
    
    var body: some View {
        HStack {
            Button(action: {
                dataStore.toggleTodoCompletion(id: item.id)
            }) {
                Image(systemName: item.completed ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(item.completed ? .green : .gray)
            }
            .buttonStyle(.plain)
            
            VStack(alignment: .leading) {
                Text(item.title)
                    .strikethrough(item.completed)
                    .foregroundColor(item.completed ? .secondary : .primary)
                
                if let dueDate = item.dueDate {
                    Text("Due: \(formatDate(dueDate))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Priority indicator
            Circle()
                .fill(priorityColor(item.priority))
                .frame(width: 12, height: 12)
        }
    }
    
    func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
    
    func priorityColor(_ priority: TodoItem.Priority) -> Color {
        switch priority {
        case .low:
            return Color.green
        case .medium:
            return Color.orange
        case .high:
            return Color.red
        }
    }
}

struct CalendarCard: View {
    @EnvironmentObject var dataStore: DataStore
    @State private var selectedDate = Date()
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Calendar")
                .font(.headline)
                .padding(.horizontal)
                .padding(.top, 8)
            
            DatePicker(
                "Selected Date",
                selection: $selectedDate,
                displayedComponents: .date
            )
            .datePickerStyle(GraphicalDatePickerStyle())
            .padding(.horizontal)
            
            Divider()
            
            Text(formattedSelectedDate())
                .font(.subheadline)
                .padding(.horizontal)
            
            if eventsForSelectedDate().isEmpty {
                Text("No events scheduled for this day.")
                    .padding()
                    .foregroundColor(.secondary)
            } else {
                List {
                    ForEach(eventsForSelectedDate()) { event in
                        CalendarEventRow(event: event)
                    }
                }
                .listStyle(PlainListStyle())
                .frame(height: min(CGFloat(eventsForSelectedDate().count * 60), 180))
            }
            
            Button(action: {
                // Navigate to add event form
            }) {
                Label("Add Event", systemImage: "plus")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
    }
    
    func formattedSelectedDate() -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .full
        return formatter.string(from: selectedDate)
    }
    
    func eventsForSelectedDate() -> [CalendarEvent] {
        return dataStore.getItemsByDate(items: dataStore.calendarEvents, date: selectedDate)
            .sorted { $0.startTime < $1.startTime }
    }
}

struct CalendarEventRow: View {
    let event: CalendarEvent
    
    var body: some View {
        HStack {
            if event.allDay {
                Rectangle()
                    .fill(Color.blue)
                    .frame(width: 4)
                    .cornerRadius(2)
                
                VStack(alignment: .leading) {
                    Text(event.title)
                        .font(.headline)
                    
                    Text("All day")
                        .font(.caption)
                    
                    if let location = event.location, !location.isEmpty {
                        Text(location)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            } else {
                VStack(alignment: .leading) {
                    Text(event.title)
                        .font(.headline)
                    
                    Text("\(formatTime(event.startTime)) - \(formatTime(event.endTime))")
                        .font(.caption)
                    
                    if let location = event.location, !location.isEmpty {
                        Text(location)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
    
    func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .none
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardView()
            .environmentObject(DataStore())
    }
}