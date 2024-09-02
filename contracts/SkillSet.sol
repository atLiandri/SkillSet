// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title A skill certification contract
/// @author Liandri
/// @notice Tags not yet implemented, for the moment only registering certificates is possible, only via proposal

// Indexes are currently required to retrieve proposals and certificates via view functions, and also to confirm proposals
// Indexes are emitted when 

// currently deployed on sepolia

// TODO 
// implement invalidate proposal, implement create certificate (without need to confirm)
// extend the view functions to all variables
// add tags to the certificate -- create a custom schema
// optional: implement ERC20 request for certificate

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISP } from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import { Attestation } from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import { DataLocation } from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import "hardhat/console.sol";

contract SkillSet is Ownable {
    ISP public spInstance;
    uint64 public schemaId;

    struct Proposal {
        string info;
        bool isValid;
    }

    //Mapping from addresses to received certificates IDs
    mapping(address => uint64[]) public addressToReceivedCertificates;
    //Mapping from addresses to issued certificates IDs
    mapping(address => uint64[]) public addressToIssuedCertificates;
    //Mapping from attestationId to tag
    mapping(uint64 => string[]) public attestationIdToTag; // not yet used

    // Mapping from proposer to an array of all proposees
    mapping(address => Proposal[]) private proposeeToReceivedProposals;
    // Mapping from proposee to an array of all proposers
    mapping(address => Proposal[]) private proposerToSentProposals;


    event CertificationRegistered(address addressIssuer, address addressReceiver, uint256 issuerCertificateIndex, uint256 receiverCertificateIndex,  uint64 attestationId);
    event ProposalSubmitted(address addressIssuer, address addressReceiver, uint256 issuerProposalIndex, uint256 receiverProposalIndex);

    constructor() Ownable(_msgSender()) { }

    function setSPInstance(address instance) external onlyOwner {
        spInstance = ISP(instance);
    }

    function setSchemaID(uint64 schemaId_) external onlyOwner {
        schemaId = schemaId_;
    }

    function submitCertificateProposal(address addressReceiver, string memory infoA) external {
        address addressIssuer = _msgSender();
        Proposal memory _proposal = Proposal({info: infoA, isValid:true});
        proposerToSentProposals[addressIssuer].push(_proposal);
        proposeeToReceivedProposals[addressReceiver].push(_proposal); 

        emit ProposalSubmitted( addressIssuer,
                                addressReceiver,
                                proposerToSentProposals[addressIssuer].length-1,
                                proposeeToReceivedProposals[addressReceiver].length-1);
    }


    function getProposalsSentBy(address proposer) external view returns (string[] memory) {
        uint256 length = proposerToSentProposals[proposer].length;
        string[] memory infos = new string[](length);

        for (uint256 i = 0; i < length; ++i) {
            infos[i] = proposerToSentProposals[proposer][i].info;
        }

        return infos;
    }

    function getProposalsReceivedBy(address proposee) external view returns (string[] memory) {
        uint256 length = proposeeToReceivedProposals[proposee].length;
        string[] memory infos = new string[](length);

        for (uint256 i = 0; i < length; ++i) {
            infos[i] = proposeeToReceivedProposals[proposee][i].info;
        }

        return infos;
    }


    function confirmProposal(address addressIssuer, uint64 indexProposee, uint64 indexProposer) external returns (uint64) {
        address addressReceiver = _msgSender();

        Proposal memory _proposalReceived = proposeeToReceivedProposals[addressReceiver][indexProposee];
        Proposal memory _proposalIssued = proposerToSentProposals[addressIssuer][indexProposer];

        require(_proposalReceived.isValid, "Proposal not found at the receiver, or invalid");
        require(_proposalIssued.isValid, "Proposal not found at the issuer, or invalid");

        bytes memory data = abi.encode(addressIssuer, addressReceiver, _proposalReceived.info);

        bytes[] memory recipients = new bytes[](2);
        recipients[0] = abi.encode(addressIssuer);
        recipients[1] = abi.encode(addressReceiver);
        Attestation memory a = Attestation({
            schemaId: schemaId,
            linkedAttestationId: 0,
            attestTimestamp: 0,
            revokeTimestamp: 0,
            attester: address(this),
            validUntil: 0,
            dataLocation: DataLocation.ONCHAIN,
            revoked: false,
            recipients: recipients,
            data: data
        });
        uint64 attestationId = spInstance.attest(a, "", "", "");

        // mapping(address => uint64) public attestationIdMapping;
        addressToReceivedCertificates[addressReceiver].push(attestationId);
        addressToIssuedCertificates[addressIssuer].push(attestationId);

        uint256 lengthIssuerCertificates = addressToIssuedCertificates[addressIssuer].length; // to avoid stack too deep errors
        uint256 lengthReceiverCertificates = addressToReceivedCertificates[addressReceiver].length;
        emit CertificationRegistered(addressIssuer, 
                                    addressReceiver, 
                                    lengthIssuerCertificates-1,
                                    lengthReceiverCertificates-1,
                                    attestationId);

        return attestationId;
    }

}