// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract RhinoNFT is ERC1155Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Token IDs
    uint256 public constant RHINO_NFT = 0;

    // Visit threshold for free mint
    uint256 public constant VISIT_THRESHOLD = 100;

    // Happiness tiers based on total buys
    // 0-4 buys: Sad | 5-14: Cautious | 15-29: Calm | 30-49: Happy | 50+: Thriving
    uint256[] public happinessTiers = [5, 15, 30, 50];

    // Metadata base URL - points to your server
    string public metadataBaseURI;

    // Server signer address - only signatures from this address are valid
    address public signerAddress;

    // Per-address visit count
    mapping(address => uint256) public visitCount;

    // Track used signatures so they can't be replayed
    mapping(bytes32 => bool) public usedSignatures;

    // Track if address has already claimed their free mint
    mapping(address => bool) public hasClaimedFreeMint;

    // Total buys drives happiness tier
    uint256 public totalBuys;

    // Events
    event VisitRecorded(address indexed visitor, uint256 newCount);
    event RhinoMinted(address indexed minter, bool wasFree);
    event HappinessLevelChanged(uint256 newLevel);
    event SignerUpdated(address newSigner);
    event MetadataURIUpdated(string newURI);

    // Errors
    error InvalidSignature();
    error SignatureAlreadyUsed();
    error NotEnoughVisits(uint256 current, uint256 required);
    error AlreadyClaimedFreeMint();
    error InsufficientPayment(uint256 sent, uint256 required);

    // Mint price for non-free mints (0.01 ETH)
    uint256 public mintPrice;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _metadataBaseURI,
        address _signerAddress,
        uint256 _mintPrice
    ) public initializer {
        __ERC1155_init(_metadataBaseURI);
        __Ownable_init(msg.sender);

        metadataBaseURI = _metadataBaseURI;
        signerAddress = _signerAddress;
        mintPrice = _mintPrice;
    }

    // Called by user with a signature from your server proving they visited
    function recordVisit(bytes memory signature) external {
        // Build the message the server signed
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, visitCount[msg.sender])
        );
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();

        // Prevent replay attacks
        if (usedSignatures[ethSignedHash]) revert SignatureAlreadyUsed();

        // Verify the signature came from our server
        address recovered = ethSignedHash.recover(signature);
        if (recovered != signerAddress) revert InvalidSignature();

        // Mark signature as used
        usedSignatures[ethSignedHash] = true;

        // Increment visit count
        visitCount[msg.sender]++;

        emit VisitRecorded(msg.sender, visitCount[msg.sender]);
    }

    // Free mint - requires 100 visits
    function claimFreeMint() external {
        if (visitCount[msg.sender] < VISIT_THRESHOLD)
            revert NotEnoughVisits(visitCount[msg.sender], VISIT_THRESHOLD);

        if (hasClaimedFreeMint[msg.sender]) revert AlreadyClaimedFreeMint();

        hasClaimedFreeMint[msg.sender] = true;

        uint256 previousTier = getHappinessTier();
        totalBuys++;
        uint256 newTier = getHappinessTier();

        _mint(msg.sender, RHINO_NFT, 1, "");

        if (newTier != previousTier) emit HappinessLevelChanged(newTier);

        emit RhinoMinted(msg.sender, true);
    }

    // Paid mint - anyone can buy
    function mintRhino() external payable {
        if (msg.value < mintPrice)
            revert InsufficientPayment(msg.value, mintPrice);

        uint256 previousTier = getHappinessTier();
        totalBuys++;
        uint256 newTier = getHappinessTier();

        _mint(msg.sender, RHINO_NFT, 1, "");

        if (newTier != previousTier) emit HappinessLevelChanged(newTier);

        emit RhinoMinted(msg.sender, false);
    }

    // Returns current happiness tier (0-4)
    function getHappinessTier() public view returns (uint256) {
        for (uint256 i = happinessTiers.length; i > 0; i--) {
            if (totalBuys >= happinessTiers[i - 1]) return i;
        }
        return 0;
    }

    // ERC-1155 uri override - points to server based on happiness tier
    function uri(uint256) public view override returns (string memory) {
        uint256 tier = getHappinessTier();
        return string(abi.encodePacked(metadataBaseURI, "/metadata/", _toString(tier)));
    }

    // Owner can update metadata base URI (for upgrades)
    function setMetadataBaseURI(string memory _newURI) external onlyOwner {
        metadataBaseURI = _newURI;
        emit MetadataURIUpdated(_newURI);
    }

    // Owner can update signer address
    function setSigner(address _newSigner) external onlyOwner {
        signerAddress = _newSigner;
        emit SignerUpdated(_newSigner);
    }

    // Owner withdraws ETH raised for conservation
    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    // Required by UUPS - only owner can upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Simple uint to string helper
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}