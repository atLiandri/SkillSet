//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";


// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */ 


contract YourContract {

	
	  struct Attestation {
        address issuer;
        string skill;
        string description;
        uint256 timestamp;

    }

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
	address public delegate;
	// State Variables
	address public immutable owner;
	string public greeting = "Building Unstoppable Apps!!!";
	bool public premium = false;
	uint256 public totalCounter = 0;
	mapping(address => uint) public userGreetingCounter;

	// Events: a way to emit log statements from smart contract that can be listened to by external parties
	event GreetingChange(
		address indexed greetingSetter,
		string newGreeting,
		bool premium,
		uint256 value
	);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address _owner) {
		owner = _owner;
	}

	// Modifier: used to define a set of rules that must be met before or after a function is executed
	// Check the withdraw() function
	modifier isOwner() {
		// msg.sender: predefined variable that represents address of the account that called the current function
		require(msg.sender == owner, "Not the Owner");
		_;
	}

	/**
	 * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
	 *
	 * @param _newGreeting (string memory) - new greeting to save on the contract
	 */
	function setGreeting(string memory _newGreeting) public payable {
		// Print data to the hardhat chain console. Remove when deploying to a live network.
		console.log(
			"Setting new greeting '%s' from %s",
			_newGreeting,
			msg.sender
		);

		// Change state variables
		greeting = _newGreeting;
		totalCounter += 1;
		userGreetingCounter[msg.sender] += 1;

		// msg.value: built-in global variable that represents the amount of ether sent with the transaction
		if (msg.value > 0) {
			premium = true;
		} else {
			premium = false;
		}

		// emit: keyword used to trigger an event
		emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
	}

	/**
	 * Function that allows the owner to withdraw all the Ether in the contract
	 * The function can only be called by the owner of the contract as defined by the isOwner modifier
	 */
	function withdraw() public isOwner {
		(bool success, ) = owner.call{ value: address(this).balance }("");
		require(success, "Failed to send Ether");
	}

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}