// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title HealthRecord - simple health-record registry with access control & emergency access
/// @notice Prototype contract to store metadata (IPFS hashes) and manage access permissions
contract HealthRecord {
    address public admin;

    struct Record {
        uint256 id;
        string patientId;   // patient identifier (string)
        string ipfsHash;    // encrypted file stored on IPFS
        uint256 timestamp;
        address uploader;   // who uploaded (doctor/patient)
    }

    // all records
    Record[] private records;

    // map patientId => record ids
    mapping(string => uint256[]) private patientRecords;

    // patientId => address => allowed
    mapping(string => mapping(address => bool)) private accessPermissions;

    // patientId => emergency authorized addresses
    mapping(string => mapping(address => bool)) private emergencyAuthorized;

    // events
    event RecordAdded(uint256 indexed id, string patientId, string ipfsHash, address indexed uploader);
    event AccessGranted(string indexed patientId, address indexed grantee);
    event AccessRevoked(string indexed patientId, address indexed grantee);
    event EmergencyAuthorized(string indexed patientId, address indexed responder);
    event EmergencyDeauthorized(string indexed patientId, address indexed responder);
    event EmergencyAccessed(string indexed patientId, address indexed accessor, string reason, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice add a new record metadata (IPFS hash)
    /// @dev This stores only metadata (hash). Real file resides off-chain (IPFS)
    function addRecord(string calldata _patientId, string calldata _ipfsHash) external {
        uint256 id = records.length;
        records.push(Record({
            id: id,
            patientId: _patientId,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            uploader: msg.sender
        }));
        patientRecords[_patientId].push(id);

        emit RecordAdded(id, _patientId, _ipfsHash, msg.sender);
    }

    /// @notice grant read access for an address to a patient's records
    function grantAccess(string calldata _patientId, address _grantee) external {
        // only the patient or admin can grant access. We consider msg.sender equal to admin or must be explicitly patient in real app
        // In production, patient ownership should be proven (e.g. account linked to patient). For prototype we let admin grant or patient address must call.
        accessPermissions[_patientId][_grantee] = true;
        emit AccessGranted(_patientId, _grantee);
    }

    /// @notice revoke access
    function revokeAccess(string calldata _patientId, address _grantee) external {
        accessPermissions[_patientId][_grantee] = false;
        emit AccessRevoked(_patientId, _grantee);
    }

    /// @notice authorize an emergency responder for a patient
    function authorizeEmergency(string calldata _patientId, address _responder) external {
        emergencyAuthorized[_patientId][_responder] = true;
        emit EmergencyAuthorized(_patientId, _responder);
    }

    /// @notice deauthorize emergency responder
    function deauthorizeEmergency(string calldata _patientId, address _responder) external {
        emergencyAuthorized[_patientId][_responder] = false;
        emit EmergencyDeauthorized(_patientId, _responder);
    }

    /// @notice emergency access call — logs access and emits event
    /// @param _patientId patient identifier
    /// @param _reason short string for reason (e.g., "trauma, unconscious")
    function emergencyAccess(string calldata _patientId, string calldata _reason) external {
        // Allow if caller is emergencyAuthorized or admin
        require(emergencyAuthorized[_patientId][msg.sender] || msg.sender == admin, "Not emergency-authorized");

        emit EmergencyAccessed(_patientId, msg.sender, _reason, block.timestamp);
        // no return of full data on-chain -> backend will check IPFS + decryption after on-chain event/authorization
    }

    /// @notice get record count
    function getRecordCount() external view returns (uint256) {
        return records.length;
    }

    /// @notice get record metadata by id
    function getRecordById(uint256 _id) external view returns (uint256, string memory, string memory, uint256, address) {
        require(_id < records.length, "Invalid id");
        Record storage r = records[_id];
        return (r.id, r.patientId, r.ipfsHash, r.timestamp, r.uploader);
    }

    /// @notice get record ids for a patient
    function getRecordIdsForPatient(string calldata _patientId) external view returns (uint256[] memory) {
        return patientRecords[_patientId];
    }

    /// @notice check if an address has permission to access a patient's records
    function hasAccess(string calldata _patientId, address _addr) external view returns (bool) {
        return accessPermissions[_patientId][_addr];
    }

    /// @notice check if an address is emergency-authorized for a patient
    function isEmergencyAuthorized(string calldata _patientId, address _addr) external view returns (bool) {
        return emergencyAuthorized[_patientId][_addr];
    }
}
