import Foundation
import CryptoKit

/// Manages security features for the ADHD Tracker iOS app
final class SecurityManager {
    // MARK: - Singleton Instance
    static let shared = SecurityManager()
    private init() {}
    
    // MARK: - Encryption Key Management
    private var encryptionKey: SymmetricKey? = nil
    
    /// Generates or retrieves the encryption key
    private func getEncryptionKey() -> SymmetricKey {
        if let existingKey = encryptionKey {
            return existingKey
        }
        
        if let savedKey = KeychainManager.shared.retrieveEncryptionKey() {
            encryptionKey = savedKey
            return savedKey
        }
        
        let newKey = SymmetricKey(size: .bits256)
        encryptionKey = newKey
        KeychainManager.shared.storeEncryptionKey(newKey)
        return newKey
    }
    
    // MARK: - Data Encryption
    func encrypt<T: Encodable>(_ data: T) throws -> Data {
        let jsonData = try JSONEncoder().encode(data)
        let key = getEncryptionKey()
        let sealedBox = try AES.GCM.seal(jsonData, using: key)
        return sealedBox.combined!
    }
    
    // MARK: - Data Decryption
    func decrypt<T: Decodable>(_ data: Data) throws -> T {
        let key = getEncryptionKey()
        let sealedBox = try AES.GCM.SealedBox(combined: data)
        let decryptedData = try AES.GCM.open(sealedBox, using: key)
        return try JSONDecoder().decode(T.self, from: decryptedData)
    }
    
    // MARK: - Input Sanitization
    func sanitizeInput(_ input: String) -> String {
        return input
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression)
    }
    
    // MARK: - Rate Limiting
    private var rateLimitStore: [String: [Date]] = [:]
    private let maxAttempts = 5
    private let timeWindow: TimeInterval = 15 * 60 // 15 minutes
    
    func checkRateLimit(forKey key: String) -> Bool {
        let now = Date()
        var attempts = rateLimitStore[key] ?? []
        
        // Remove old attempts
        attempts = attempts.filter { now.timeIntervalSince($0) < timeWindow }
        
        if attempts.count >= maxAttempts {
            return false
        }
        
        attempts.append(now)
        rateLimitStore[key] = attempts
        return true
    }
    
    // MARK: - Secure Data Deletion
    func secureDelete(key: String) {
        // Overwrite data with random bytes before deletion
        let random = Data((0..<1024).map { _ in UInt8.random(in: 0...255) })
        UserDefaults.standard.set(random, forKey: key)
        UserDefaults.standard.removeObject(forKey: key)
    }
    
    // MARK: - Error Handling
    enum SecurityError: LocalizedError {
        case encryptionFailed
        case decryptionFailed
        case invalidInput
        case rateLimitExceeded
        case unauthorized
        
        var errorDescription: String? {
            switch self {
            case .encryptionFailed:
                return "Failed to encrypt data"
            case .decryptionFailed:
                return "Failed to decrypt data"
            case .invalidInput:
                return "Invalid input provided"
            case .rateLimitExceeded:
                return "Too many attempts. Please try again later"
            case .unauthorized:
                return "Unauthorized access"
            }
        }
    }
}

// MARK: - Keychain Manager
private final class KeychainManager {
    static let shared = KeychainManager()
    private init() {}
    
    func storeEncryptionKey(_ key: SymmetricKey) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: "com.adhdtracker.encryptionkey",
            kSecValueData as String: key.withUnsafeBytes { Data($0) }
        ]
        
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }
    
    func retrieveEncryptionKey() -> SymmetricKey? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: "com.adhdtracker.encryptionkey",
            kSecReturnData as String: true
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let keyData = result as? Data else {
            return nil
        }
        
        return SymmetricKey(data: keyData)
    }
}