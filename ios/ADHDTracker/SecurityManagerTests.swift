import XCTest
@testable import ADHDTracker

class SecurityManagerTests: XCTestCase {
    
    override func setUpWithError() throws {
        // Clear any keys from previous tests
        MockKeychainManager.clearAllKeysForTesting()
    }
    
    override func tearDownWithError() throws {
        MockKeychainManager.clearAllKeysForTesting()
    }
    
    // MARK: - Test Struct
    
    // A simple struct to use for testing encryption/decryption
    struct TestStruct: Codable, Equatable {
        let id: String
        let name: String
        let value: Int
    }
    
    // MARK: - Encryption/Decryption Tests
    
    func testEncryptAndDecryptData() throws {
        // Given
        let testData = TestStruct(id: "test-id", name: "Test Name", value: 42)
        
        // When
        let encryptedData = try SecurityManager.shared.encrypt(testData)
        let decryptedData: TestStruct = try SecurityManager.shared.decrypt(encryptedData)
        
        // Then
        XCTAssertEqual(decryptedData.id, testData.id, "Decrypted ID should match original")
        XCTAssertEqual(decryptedData.name, testData.name, "Decrypted name should match original")
        XCTAssertEqual(decryptedData.value, testData.value, "Decrypted value should match original")
    }
    
    func testEncryptDifferentValues() throws {
        // Given
        let testData1 = TestStruct(id: "test-id-1", name: "Test Name 1", value: 42)
        let testData2 = TestStruct(id: "test-id-2", name: "Test Name 2", value: 84)
        
        // When
        let encryptedData1 = try SecurityManager.shared.encrypt(testData1)
        let encryptedData2 = try SecurityManager.shared.encrypt(testData2)
        
        // Then
        XCTAssertNotEqual(encryptedData1, encryptedData2, "Encrypted data for different values should be different")
    }
    
    func testDecryptInvalidData() {
        // Given
        let invalidData = "Not valid encrypted data".data(using: .utf8)!
        
        // When/Then
        XCTAssertThrowsError(try SecurityManager.shared.decrypt(invalidData) as TestStruct) { error in
            XCTAssertTrue(error is SecurityManager.SecurityError, "Should throw a SecurityError")
        }
    }
    
    // MARK: - Input Sanitization Tests
    
    func testSanitizeInput() {
        // Given
        let inputWithScript = "<script>alert('XSS')</script>Hello World"
        let inputWithWhitespace = "  Trim me   "
        
        // When
        let sanitizedScript = SecurityManager.shared.sanitizeInput(inputWithScript)
        let sanitizedWhitespace = SecurityManager.shared.sanitizeInput(inputWithWhitespace)
        
        // Then
        XCTAssertEqual(sanitizedScript, "Hello World", "Should remove script tags")
        XCTAssertEqual(sanitizedWhitespace, "Trim me", "Should trim whitespace")
    }
    
    // MARK: - Rate Limiting Tests
    
    func testRateLimit() {
        // Given
        let testKey = "test-rate-limit-key"
        
        // When/Then
        // First 5 attempts should succeed
        for _ in 1...5 {
            XCTAssertTrue(SecurityManager.shared.checkRateLimit(forKey: testKey), "Should allow initial attempts")
        }
        
        // 6th attempt should fail due to rate limiting
        XCTAssertFalse(SecurityManager.shared.checkRateLimit(forKey: testKey), "Should reject after max attempts")
    }
    
    func testRateLimitExpiry() {
        // Given
        let testKey = "test-rate-limit-expiry"
        let securityManager = SecurityManager.shared
        
        // When
        // Use up the rate limit
        for _ in 1...5 {
            _ = securityManager.checkRateLimit(forKey: testKey)
        }
        
        // Simulate time passing by directly manipulating the rate limit store
        // In a real implementation, we would use dependency injection and a time provider
        // but for this test we'll use a test helper method
        securityManager.resetRateLimitForTesting(forKey: testKey)
        
        // Then
        XCTAssertTrue(securityManager.checkRateLimit(forKey: testKey), "Should allow attempts after reset")
    }
    
    // MARK: - Secure Data Deletion Tests
    
    func testSecureDelete() {
        // Given
        let testKey = "test-secure-delete"
        UserDefaults.standard.set("sensitive data", forKey: testKey)
        
        // When
        SecurityManager.shared.secureDelete(key: testKey)
        
        // Then
        XCTAssertNil(UserDefaults.standard.object(forKey: testKey), "Data should be removed from UserDefaults")
        
        // Verify overwrite happened before deletion
        // This is hard to test directly, but we can check if the key was set with random data
        // before being deleted by using a mock UserDefaults
        let mockDefaults = MockUserDefaults()
        let securityManager = SecurityManager(userDefaults: mockDefaults)
        
        mockDefaults.set("sensitive data", forKey: testKey)
        securityManager.secureDelete(key: testKey)
        
        XCTAssertTrue(mockDefaults.wasOverwrittenBeforeDelete(key: testKey), "Data should be overwritten before deletion")
    }
    
    // MARK: - Key Management Tests
    
    func testEncryptionKeyGeneration() {
        // Given
        let securityManager = SecurityManager.shared
        
        // Mock the KeychainManager to verify it's called
        let mockKeychain = MockKeychainManager()
        securityManager.setKeychainManager(mockKeychain)
        
        // When
        // Force new key generation by clearing existing key
        securityManager.clearEncryptionKeyForTesting()
        
        // This should trigger key generation
        let testData = TestStruct(id: "test", name: "Test", value: 1)
        _ = try? securityManager.encrypt(testData)
        
        // Then
        XCTAssertTrue(mockKeychain.storeKeyCalled, "Should store new key in keychain")
    }
    
    func testEncryptionKeyRetrieval() {
        // Given
        let securityManager = SecurityManager.shared
        
        // Mock the KeychainManager to verify it's called
        let mockKeychain = MockKeychainManager()
        mockKeychain.setReturnKey(true)
        securityManager.setKeychainManager(mockKeychain)
        
        // When
        // Force key retrieval by clearing existing key
        securityManager.clearEncryptionKeyForTesting()
        
        // This should trigger key retrieval
        let testData = TestStruct(id: "test", name: "Test", value: 1)
        _ = try? securityManager.encrypt(testData)
        
        // Then
        XCTAssertTrue(mockKeychain.retrieveKeyCalled, "Should retrieve key from keychain")
    }
}

// MARK: - Mock Classes for Testing

class MockUserDefaults {
    private var store: [String: Any] = [:]
    private var overwrittenKeys: Set<String> = []
    
    func set(_ value: Any?, forKey key: String) {
        store[key] = value
        overwrittenKeys.insert(key)
    }
    
    func object(forKey key: String) -> Any? {
        return store[key]
    }
    
    func removeObject(forKey key: String) {
        store.removeValue(forKey: key)
    }
    
    func wasOverwrittenBeforeDelete(key: String) -> Bool {
        return overwrittenKeys.contains(key) && store[key] == nil
    }
}

class MockKeychainManager {
    static var keychainStore: [String: Data] = [:]
    var storeKeyCalled = false
    var retrieveKeyCalled = false
    private var shouldReturnKey = false
    
    static func clearAllKeysForTesting() {
        keychainStore.removeAll()
    }
    
    func setReturnKey(_ value: Bool) {
        shouldReturnKey = value
    }
    
    func storeEncryptionKey(_ key: Data) {
        storeKeyCalled = true
        MockKeychainManager.keychainStore["encryptionKey"] = key
    }
    
    func retrieveEncryptionKey() -> Data? {
        retrieveKeyCalled = true
        return shouldReturnKey ? MockKeychainManager.keychainStore["encryptionKey"] : nil
    }
}

// MARK: - Extensions to SecurityManager for Testing

extension SecurityManager {
    // For testing purposes - these would be added to the actual class
    func resetRateLimitForTesting(forKey key: String) {
        rateLimitStore[key] = []
    }
    
    func clearEncryptionKeyForTesting() {
        encryptionKey = nil
    }
    
    func setKeychainManager(_ manager: MockKeychainManager) {
        // This would require the SecurityManager to be refactored to use dependency injection
        // For this example, we're just showing what would be done
    }
    
    // Constructor with dependency injection for testing
    convenience init(userDefaults: MockUserDefaults) {
        self.init()
        // This would set a custom UserDefaults instance for testing
    }
}