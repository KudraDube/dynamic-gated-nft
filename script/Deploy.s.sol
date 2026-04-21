// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/RhinoNFT.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address signerAddress = vm.envAddress("SIGNER_ADDRESS");
        string memory metadataBaseURI = vm.envString("METADATA_BASE_URI");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy implementation
        RhinoNFT implementation = new RhinoNFT();

        // Encode initialize call
        bytes memory initData = abi.encodeWithSelector(
            RhinoNFT.initialize.selector,
            metadataBaseURI,
            signerAddress,
            0.01 ether
        );

        // Deploy proxy pointing to implementation
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        vm.stopBroadcast();

        console.log("Implementation deployed at:", address(implementation));
        console.log("Proxy deployed at:", address(proxy));
    }
}