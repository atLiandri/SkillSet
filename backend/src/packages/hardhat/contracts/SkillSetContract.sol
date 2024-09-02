// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SkillSetContract {
    // Starting at 0 with Skill, ...
    enum Schema { Skill, GameAchievement, RecommendationLetter, ProfessionalCertificate }

    // Structure to hold the Certificate
    struct Certificate {
        uint256 id;
        address issuer;
        address recipient;
        Schema schema;
        string[] tags;
        bytes data;
        uint256 timestamp;
        string description;
    }
    
    
    uint256 private nextCertificateId = 1;
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public issuedCertificates;
    mapping(address => uint256[]) public receivedCertificates;

    event CertificateIssued(uint256 indexed id, address indexed issuer, address indexed recipient, Schema schema);
    event TagAdded(uint256 indexed id, string tag);

    function registerCertificate(address recipient, Schema schema, bytes memory data,string memory description) external {
        require(msg.sender == recipient, "Operation not permited. The recipient must be different ");
        uint256 certificateId = nextCertificateId++;
        Certificate storage newCertificate = certificates[certificateId];
        newCertificate.id = certificateId;
        newCertificate.issuer = msg.sender;
        newCertificate.recipient = recipient;
        newCertificate.schema = schema;
        newCertificate.data = data;
        newCertificate.timestamp = block.timestamp;
        newCertificate.description = description;

        issuedCertificates[msg.sender].push(certificateId);
        receivedCertificates[recipient].push(certificateId);

        emit CertificateIssued(certificateId, msg.sender, recipient, schema);
    }

    function addTagToCertificate(uint256 certificateId, string memory tag) external {
        Certificate storage cert = certificates[certificateId];

        cert.tags.push(tag);
        emit TagAdded(certificateId, tag);
    }

    function getIssuedCertificates(address user) external view returns (uint256[] memory) {
        return issuedCertificates[user];
    }

    function getReceivedCertificates(address user) external view returns (uint256[] memory) {
        return receivedCertificates[user];
    }

    function getCertificatesByTag(string memory tag) external view returns (uint256[] memory) {
        uint256[] memory matchedCertificates = new uint256[](nextCertificateId);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextCertificateId; i++) {
            Certificate storage cert = certificates[i];
            for (uint256 j = 0; j < cert.tags.length; j++) {
                if (keccak256(abi.encodePacked(cert.tags[j])) == keccak256(abi.encodePacked(tag))) {
                    matchedCertificates[count] = cert.id;
                    count++;
                    break;
                }
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 k = 0; k < count; k++) {
            result[k] = matchedCertificates[k];
        }
        return result;
    }

    function getCertificateDetails(uint256 certificateId) external view returns (Certificate memory) {
        return certificates[certificateId];
    }
}
