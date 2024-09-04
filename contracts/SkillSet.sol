// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title A skill certification contract
/// @author Liandri
/// @notice Tags not yet implemented, for the moment only registering certificates is possible, only via proposal

// TODO 
// implement invalidate proposal, implement create certificate (without need to confirm)
// extend the view functions to all variables
// add tags to the certificate
// optional: implement ERC20 request for certificate

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISP } from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import { Attestation } from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import { DataLocation } from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import "hardhat/console.sol";

contract SkillSet is Ownable {
    ISP public spInstance;
    uint64 public schemaId;

    struct SkillProposal {
        string info;
        uint256 level;
        uint256 maximumLevel;
        bool isValid;
    }

    struct ProposalBookmark{ // used to retrieve a proposal
        uint256 index;
        address issuerAddress;
    }

    //Mapping from addresses to received certificates IDs
    mapping(address => uint256[]) public addressToReceivedCertificates;
    //Mapping from addresses to issued certificates IDs
    mapping(address => uint256[]) public addressToIssuedCertificates;
    //Mapping from attestationId to tag
    mapping(uint256 => string[]) public attestationIdToTag; // not yet used


    // Mapping from proposer to sent proposals
    mapping(address => SkillProposal[]) private proposerToSentProposals;
    // Mapping from proposer to an array of bookmarks that allow to retrieve information from the map above
    mapping(address => ProposalBookmark[]) private proposeeToReceivedProposalIndices;


    event CertificationRegistered(address addressIssuer, address addressReceiver, uint256 issuerCertificateIndex, uint256 receiverCertificateIndex,  uint64 attestationId);
    event ProposalSubmitted(address addressIssuer, address addressReceiver, uint256 issuerProposalIndex, uint256 receiverProposalIndex);

    constructor() Ownable(_msgSender()) { }

    function setSPInstance(address instance) external onlyOwner {
        spInstance = ISP(instance); // to be set to 0x878c92FD89d8E0B93Dc0a3c907A2adc7577e39c5 
    }

    function setSchemaID(uint64 schemaId_) external onlyOwner {
        schemaId = schemaId_;      // to be set to 0xa8 (skill schema) https://testnet-scan.sign.global/schema/onchain_evm_11155111_0xa8
    }

    function submitCertificateProposal(address addressReceiver,uint256 _level, uint256 _maximumLevel, string memory infoA) external {
        // sumbits a skill proposal that can later be accepted by receiver address
        address addressIssuer = _msgSender();
        SkillProposal memory _proposal = SkillProposal({info: infoA,level:_level,maximumLevel:_maximumLevel, isValid:true});
        proposerToSentProposals[addressIssuer].push(_proposal);
        uint256 proposalIndex = proposerToSentProposals[addressIssuer].length-1;
        ProposalBookmark memory _proposalBookmark = ProposalBookmark({
            index: proposalIndex,
            issuerAddress: addressIssuer});
        proposeeToReceivedProposalIndices[addressReceiver].push(_proposalBookmark); 

        emit ProposalSubmitted( addressIssuer,
                                addressReceiver,
                                proposalIndex,
                                proposeeToReceivedProposalIndices[addressReceiver].length-1);
    }


    function getAllProposalsSentBy(address proposer) external view returns (string[] memory) {
        // get the array of the info attached to all proposals sent by proposer
        uint256 length = proposerToSentProposals[proposer].length;
        string[] memory infos = new string[](length);

        for (uint256 i = 0; i < length; ++i) {
            infos[i] = proposerToSentProposals[proposer][i].info;
        }

        return infos;
    }

    function getProposalsReceivedBy(address proposee) external view returns (address[] memory, uint256[] memory) {
        // get array of all the issuers that have sent a proposal to proposee, together with
        // an index array that allows to retrieve the right proposal from 
        // the output of getAllProposalsSentBy
        uint256 length = proposeeToReceivedProposalIndices[proposee].length;
        uint256[] memory indices = new uint256[](length);
        address[] memory issuers = new address[](length);
        for (uint256 i = 0; i < length; ++i) {
            indices[i] = proposeeToReceivedProposalIndices[proposee][i].index;
            issuers[i] = proposeeToReceivedProposalIndices[proposee][i].issuerAddress;
        }

        return (issuers, indices);
    }


    function confirmProposal(uint256 indexProposee) external returns (uint256) {
        // transforms a proposal into a certificate. Only requires an index that selects
        // among the proposals received by msgSender, and then looks for the full proposal
        // in proposerToSentProposals
        address addressReceiver = _msgSender();

        uint256 index = proposeeToReceivedProposalIndices[addressReceiver][indexProposee].index;
        address addressIssuer = proposeeToReceivedProposalIndices[addressReceiver][indexProposee].issuerAddress;

        SkillProposal memory _proposal = proposerToSentProposals[addressIssuer][index];

        require(_proposal.isValid, "SkillProposal not found at the receiver, or invalid");

        bytes memory data = abi.encode(addressIssuer, addressReceiver,_proposal.level, _proposal.maximumLevel, _proposal.info);

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
