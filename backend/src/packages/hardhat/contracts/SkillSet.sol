// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SkillSet {
    struct Attestation {
        address issuer;
        string skill;
        string description;
        uint256 timestamp;
    }
    address public delegate;
    // Mapping from user address to a list of their attestations
    mapping(address => Attestation[]) public attestations;

    // Mapping from user address to a list of addresses they trust
    mapping(address => address[]) public trustedIssuers;

    // Event emitted when a new attestation is created
    event AttestationCreated(address indexed issuer, address indexed recipient, string skill, string description, uint256 timestamp);

    // Function to create an attestation for a skill
    function createAttestation(address _recipient, string memory _skill, string memory _description) public {
        Attestation memory newAttestation = Attestation({
            issuer: msg.sender,
            skill: _skill,
            description: _description,
            timestamp: block.timestamp
        });

        attestations[_recipient].push(newAttestation);

        emit AttestationCreated(msg.sender, _recipient, _skill, _description, block.timestamp);
    }

    // Function to get attestations for a specific user
    function getAttestations(address _user) public view returns (Attestation[] memory) {
        return attestations[_user];
    }

    // Function to trust another issuer
    function trustIssuer(address _issuer) public {
        trustedIssuers[msg.sender].push(_issuer);
    }

    // Function to check if a user trusts a specific issuer
    function isTrustedIssuer(address _user, address _issuer) public view returns (bool) {
        address[] memory trusted = trustedIssuers[_user];
        for (uint256 i = 0; i < trusted.length; i++) {
            if (trusted[i] == _issuer) {
                return true;
            }
        }
        return false;
    }

    // Function to get all trusted issuers for a user
    function getTrustedIssuers(address _user) public view returns (address[] memory) {
        return trustedIssuers[_user];
    }
}
