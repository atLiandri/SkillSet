// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SkillSet certification contract
/// @author Liandri

// currently deployed on sepolia

// TODO 
// add tags to the certificate -- create a custom schema

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISP } from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import { Attestation } from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import { DataLocation } from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import "hardhat/console.sol";

contract SkillSet is Ownable {
    ISP public spInstance = ISP(0x878c92FD89d8E0B93Dc0a3c907A2adc7577e39c5);
    uint64 public schemaId = 0x10f;

    struct SkillProposal {
        address receiver;
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


    // Mapping from address to sent proposals
    mapping(address => SkillProposal[]) private addressToSentProposals;
    // Mapping from address to an array of bookmarks that allow to retrieve information from the map above
    mapping(address => ProposalBookmark[]) private addressToReceivedProposalIndices;


    event CertificationRegistered(address addressIssuer, address addressReceiver, uint256 issuerCertificateIndex, uint256 receiverCertificateIndex,  uint64 attestationId);
    event ProposalSubmitted(address addressIssuer, address addressReceiver, uint256 issuerProposalIndex, uint256 receiverProposalIndex);

    constructor() Ownable(_msgSender()) { }

    function setSPInstance(address instance) external onlyOwner {
        spInstance = ISP(instance);  
    }

    function setSchemaID(uint64 schemaId_) external onlyOwner {
        schemaId = schemaId_; 
    }

    function submitCertificateProposal(address addressReceiver,uint256 _level, uint256 _maximumLevel, string memory infoA) external {
        // TODO add require addresses are different
        // sumbits a skill proposal that can later be accepted by receiver address
        address addressIssuer = _msgSender();
        SkillProposal memory _proposal = SkillProposal({receiver: addressReceiver, info: infoA,level:_level,maximumLevel:_maximumLevel, isValid:true});
        addressToSentProposals[addressIssuer].push(_proposal);
        uint256 proposalIndex = addressToSentProposals[addressIssuer].length-1;
        ProposalBookmark memory _proposalBookmark = ProposalBookmark({
            index: proposalIndex,
            issuerAddress: addressIssuer});
        addressToReceivedProposalIndices[addressReceiver].push(_proposalBookmark); 

        emit ProposalSubmitted( addressIssuer,
                                addressReceiver,
                                proposalIndex,
                                addressToReceivedProposalIndices[addressReceiver].length-1);
    }

    function revokeCertificateProposal(uint256 index) external {
        address addressIssuer = _msgSender();
        addressToSentProposals[addressIssuer][index].isValid = false;
    }

    function getAllProposalsSentBy(address proposer) external view returns (address[] memory, string[] memory, uint256[] memory, uint256[] memory, bool[] memory) {
        // get the array of all info attached to all proposals sent by proposer
        uint256 length = addressToSentProposals[proposer].length;
        string[] memory infos = new string[](length);
        address[] memory receiverAddresses = new address[](length);
        uint256[] memory levels = new uint256[] (length);
        uint256[] memory maximumLevels = new uint256[] (length);
        bool[] memory isValids = new bool[] (length);

        for (uint256 i = 0; i < length; ++i) {
            receiverAddresses[i] = addressToSentProposals[proposer][i].receiver;
            infos[i] = addressToSentProposals[proposer][i].info;
            levels[i] = addressToSentProposals[proposer][i].level;
            maximumLevels[i] = addressToSentProposals[proposer][i].maximumLevel;
            isValids[i] = addressToSentProposals[proposer][i].isValid;
        }
        return (receiverAddresses, infos, levels, maximumLevels,isValids);
    }

    function getProposalsReceivedBy(address receiver) external view returns (address[] memory, uint256[] memory) {
        // get array of all the issuers that have sent a proposal to the receiver, together with
        // an index array that, together with the address allows to retrieve the right proposal from 
        // the output of getAllProposalsSentBy
        uint256 length = addressToReceivedProposalIndices[receiver].length;
        uint256[] memory indices = new uint256[](length);
        address[] memory issuers = new address[](length);
        for (uint256 i = 0; i < length; ++i) {
            indices[i] = addressToReceivedProposalIndices[receiver][i].index;
            issuers[i] = addressToReceivedProposalIndices[receiver][i].issuerAddress;
        }

        return (issuers, indices);
    }

    function getCertificatesIssuedBy(address issuer) external view returns (uint256[] memory) {
        return addressToIssuedCertificates[issuer];
    }

    function getCertificatesReceivedBy(address receiver) external view returns (uint256[] memory) {
        return addressToReceivedCertificates[receiver];
    }

    function confirmProposal(uint256 indexReceiver) external returns (uint256) {
        // transforms a proposal into a certificate. Only requires an index that selects
        // among the proposals received by msgSender, and then looks for the full proposal
        // in addressToSentProposals
        address addressReceiver = _msgSender();

        uint256 index = addressToReceivedProposalIndices[addressReceiver][indexReceiver].index;
        address addressIssuer = addressToReceivedProposalIndices[addressReceiver][indexReceiver].issuerAddress;

        SkillProposal memory _proposal = addressToSentProposals[addressIssuer][index];

        require(_proposal.isValid, "SkillProposal not found at the receiver, or invalid");

        bytes memory data = abi.encode(addressIssuer, addressReceiver,_proposal.level, _proposal.maximumLevel, _proposal.info);

        bytes[] memory recipients = new bytes[](1);
        recipients[0] = abi.encode(addressReceiver);
        Attestation memory a = Attestation({
            schemaId: schemaId,
            linkedAttestationId: 0,
            attestTimestamp: 0,
            revokeTimestamp: 0,
            attester: address(this), // this contract instance is the attester
            validUntil: 0,
            dataLocation: DataLocation.ONCHAIN,
            revoked: false,
            recipients: recipients,
            data: data
        });
        // addressReceiver is passed as extraData for the cooldownHook
        uint64 attestationId = spInstance.attest(a, "", "", abi.encode(addressReceiver));

        // proposal is no longer valid
        addressToSentProposals[addressIssuer][index].isValid = false;

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
