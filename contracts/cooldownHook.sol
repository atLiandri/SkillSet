// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

//TODO implement setcooldown

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISPHook } from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract cooldownManager is Ownable {
    
        constructor() Ownable(_msgSender()) { }

        error tooSoon(bytes encodedReceiver, uint256 remainingCooldown);

        mapping(bytes encodedReceiver =>uint256 lastInteractionTime) public lastInteracted;
        uint256 public cooldown = 0;

        function setCooldown(uint256 _cooldown) external onlyOwner{
            cooldown = _cooldown;
        }

        function _requireCooldown(bytes calldata encodedReceiver) internal {
            unchecked{ // "if" ensures "greater then" and block.timestamp always greater than one day
                if (lastInteracted[encodedReceiver]>block.timestamp-cooldown){ //one day in seconds
                    revert tooSoon({
                        encodedReceiver: encodedReceiver,
                        remainingCooldown: lastInteracted[encodedReceiver]-block.timestamp+cooldown
                        });
                }
            }
            lastInteracted[encodedReceiver] = block.timestamp;
        }

        function viewCooldown() external view returns (uint256){
            return cooldown;
        }

        function viewLastInteractionTime(address user) external view returns (uint256){
            return lastInteracted[abi.encode(user)];
        }

}

contract cooldownHook is ISPHook, cooldownManager{

    function didReceiveAttestation(
        address ,
        uint64 ,
        uint64 ,
        bytes calldata encodedReceiver
    )
        external
        payable {
            _requireCooldown(encodedReceiver);
        }

    // for the moment we don't use remaining functions 

    function didReceiveAttestation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        IERC20 resolverFeeERC20Token,
        uint256 resolverFeeERC20Amount,
        bytes calldata extraData
    )
        external{}

    function didReceiveRevocation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata extraData
    )
        external
        payable{}

    function didReceiveRevocation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        IERC20 resolverFeeERC20Token,
        uint256 resolverFeeERC20Amount,
        bytes calldata extraData
    )
        external{}
}