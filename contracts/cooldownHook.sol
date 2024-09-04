// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISPHook } from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract cooldownManager is Ownable {
        constructor() Ownable(_msgSender()) { }

        error tooSoon(address attester, uint256 remainingCooldown);

        mapping(address=>uint256) lastInteracted;

        function _requireCooldown(address attester) internal {
            unchecked{ // "if" ensures "greater then" and block.timestamp always greater than one day
                if (lastInteracted[attester]>block.timestamp-86400){ //one day in seconds
                    revert tooSoon({
                        attester: attester,
                        remainingCooldown: lastInteracted[attester]-block.timestamp+86400
                        });
                }
                lastInteracted[attester] = block.timestamp;
            }
        }
}

contract cooldownHook is ISPHook, cooldownManager{
    function didReceiveAttestation(
        address attester,
        uint64 ,
        uint64 ,
        bytes calldata 
    )
        external
        payable {
            _requireCooldown(attester);
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