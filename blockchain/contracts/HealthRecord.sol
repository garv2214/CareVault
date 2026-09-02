// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title HealthRecord - Decentralized health-record registry with access control & emergency access
/// @notice Stores cryptographic hashes of encrypted off-chain records (IPFS) and manages permissions
contract HealthRecord {
    address public admin;

    struct Record {
        uint256 id;
        string patientId;
        string ipfsHash;
        string contentHash;   // SHA-256 fingerprint of encrypted payload
        uint256 timestamp;
        address uploader;
    }

    struct AccessGrant {
        address grantee;
        uint256 expiresAt;    // 0 = permanent
        bool active;
    }

    struct AuditEntry {
        uint256 id;
        string patientId;
        address actor;
        string action;
        string detail;
        uint256 timestamp;
    }

    Record[] private records;
    AuditEntry[] private auditLog;

    mapping(string => address) public patientOwners;
    mapping(string => uint256[]) private patientRecords;
    mapping(string => mapping(address => AccessGrant)) private accessPermissions;
    mapping(string => mapping(address => bool)) private emergencyAuthorized;
    mapping(string => string) private emergencyTokens; // patientId => hashed token
    mapping(address => string) private walletToPatient;

    event PatientRegistered(string indexed patientId, address indexed owner);
    event RecordAdded(uint256 indexed id, string patientId, string ipfsHash, string contentHash, address indexed uploader);
    event AccessGranted(string indexed patientId, address indexed grantee, uint256 expiresAt);
    event AccessRevoked(string indexed patientId, address indexed grantee);
    event EmergencyAuthorized(string indexed patientId, address indexed responder);
    event EmergencyDeauthorized(string indexed patientId, address indexed responder);
    event EmergencyAccessed(string indexed patientId, address indexed accessor, string reason, uint256 timestamp);
    event EmergencyTokenSet(string indexed patientId);
    event BreakGlassAccess(string indexed patientId, address indexed accessor, string reason, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyPatientOrAdmin(string calldata _patientId) {
        require(
            msg.sender == patientOwners[_patientId] || msg.sender == admin,
            "Not patient owner or admin"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function _log(string memory _patientId, string memory _action, string memory _detail) internal {
        auditLog.push(AuditEntry({
            id: auditLog.length,
            patientId: _patientId,
            actor: msg.sender,
            action: _action,
            detail: _detail,
            timestamp: block.timestamp
        }));
    }

    /// @notice Register a patient and link wallet ownership
    function registerPatient(string calldata _patientId) external {
        require(patientOwners[_patientId] == address(0), "Patient already registered");
        require(bytes(walletToPatient[msg.sender]).length == 0, "Wallet already linked");
        patientOwners[_patientId] = msg.sender;
        walletToPatient[msg.sender] = _patientId;
        _log(_patientId, "PATIENT_REGISTERED", "Wallet linked");
        emit PatientRegistered(_patientId, msg.sender);
    }

    /// @notice Add record metadata with IPFS hash and content fingerprint
    function addRecord(
        string calldata _patientId,
        string calldata _ipfsHash,
        string calldata _contentHash
    ) external {
        require(bytes(_patientId).length > 0, "Invalid patientId");
        require(bytes(_ipfsHash).length > 0, "Invalid ipfsHash");
        require(bytes(_contentHash).length > 0, "Invalid contentHash");

        uint256 id = records.length;
        records.push(Record({
            id: id,
            patientId: _patientId,
            ipfsHash: _ipfsHash,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            uploader: msg.sender
        }));
        patientRecords[_patientId].push(id);

        _log(_patientId, "RECORD_ADDED", _ipfsHash);
        emit RecordAdded(id, _patientId, _ipfsHash, _contentHash, msg.sender);
    }

    /// @notice Grant access with optional expiry (0 = permanent)
    function grantAccess(
        string calldata _patientId,
        address _grantee,
        uint256 _expiresAt
    ) external onlyPatientOrAdmin(_patientId) {
        accessPermissions[_patientId][_grantee] = AccessGrant({
            grantee: _grantee,
            expiresAt: _expiresAt,
            active: true
        });
        _log(_patientId, "ACCESS_GRANTED", _toHex(_grantee));
        emit AccessGranted(_patientId, _grantee, _expiresAt);
    }

    function revokeAccess(string calldata _patientId, address _grantee) external onlyPatientOrAdmin(_patientId) {
        accessPermissions[_patientId][_grantee].active = false;
        _log(_patientId, "ACCESS_REVOKED", _toHex(_grantee));
        emit AccessRevoked(_patientId, _grantee);
    }

    function authorizeEmergency(string calldata _patientId, address _responder) external onlyPatientOrAdmin(_patientId) {
        emergencyAuthorized[_patientId][_responder] = true;
        _log(_patientId, "EMERGENCY_AUTH", _toHex(_responder));
        emit EmergencyAuthorized(_patientId, _responder);
    }

    function deauthorizeEmergency(string calldata _patientId, address _responder) external onlyPatientOrAdmin(_patientId) {
        emergencyAuthorized[_patientId][_responder] = false;
        _log(_patientId, "EMERGENCY_DEAUTH", _toHex(_responder));
        emit EmergencyDeauthorized(_patientId, _responder);
    }

    /// @notice Set emergency break-glass token (hashed off-chain token stored on-chain)
    function setEmergencyToken(string calldata _patientId, string calldata _hashedToken) external onlyPatientOrAdmin(_patientId) {
        emergencyTokens[_patientId] = _hashedToken;
        _log(_patientId, "EMERGENCY_TOKEN_SET", "");
        emit EmergencyTokenSet(_patientId);
    }

    /// @notice Standard emergency access for pre-authorized responders
    function emergencyAccess(string calldata _patientId, string calldata _reason) external {
        require(
            emergencyAuthorized[_patientId][msg.sender] || msg.sender == admin,
            "Not emergency-authorized"
        );
        _log(_patientId, "EMERGENCY_ACCESS", _reason);
        emit EmergencyAccessed(_patientId, msg.sender, _reason, block.timestamp);
    }

    /// @notice Break-glass access with digital token validation (for incapacitated patients)
    function breakGlassAccess(
        string calldata _patientId,
        string calldata _hashedToken,
        string calldata _reason
    ) external {
        require(
            keccak256(bytes(emergencyTokens[_patientId])) == keccak256(bytes(_hashedToken)),
            "Invalid emergency token"
        );
        require(bytes(_reason).length > 0, "Reason required");
        _log(_patientId, "BREAK_GLASS", _reason);
        emit BreakGlassAccess(_patientId, msg.sender, _reason, block.timestamp);
    }

    function hasAccess(string calldata _patientId, address _addr) external view returns (bool) {
        AccessGrant memory grant = accessPermissions[_patientId][_addr];
        if (!grant.active) return false;
        if (grant.expiresAt > 0 && block.timestamp > grant.expiresAt) return false;
        return true;
    }

    function isEmergencyAuthorized(string calldata _patientId, address _addr) external view returns (bool) {
        return emergencyAuthorized[_patientId][_addr];
    }

    function getRecordCount() external view returns (uint256) {
        return records.length;
    }

    function getRecordById(uint256 _id) external view returns (
        uint256, string memory, string memory, string memory, uint256, address
    ) {
        require(_id < records.length, "Invalid id");
        Record storage r = records[_id];
        return (r.id, r.patientId, r.ipfsHash, r.contentHash, r.timestamp, r.uploader);
    }

    function getRecordIdsForPatient(string calldata _patientId) external view returns (uint256[] memory) {
        return patientRecords[_patientId];
    }

    function getAuditLogCount() external view returns (uint256) {
        return auditLog.length;
    }

    function getAuditEntry(uint256 _id) external view returns (
        uint256, string memory, address, string memory, string memory, uint256
    ) {
        require(_id < auditLog.length, "Invalid audit id");
        AuditEntry storage e = auditLog[_id];
        return (e.id, e.patientId, e.actor, e.action, e.detail, e.timestamp);
    }

    function getPatientOwner(string calldata _patientId) external view returns (address) {
        return patientOwners[_patientId];
    }

    function _toHex(address _addr) internal pure returns (string memory) {
        bytes20 data = bytes20(_addr);
        bytes16 hexSymbols = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = hexSymbols[uint8(data[i] >> 4)];
            str[3 + i * 2] = hexSymbols[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
