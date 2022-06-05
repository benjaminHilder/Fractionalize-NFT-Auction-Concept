pragma solidity 0.8.14;
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import './FractionToken.sol';

contract MainContract is IERC721Receiver {
    mapping(ERC721 => mapping(uint => bool)) isNftDeposited;
    mapping(ERC721 => mapping(uint => address)) nftOwner;
    mapping(ERC721 => mapping(uint => bool)) isNftChangingOwner;

    
    mapping(ERC721 => mapping(uint => bool)) isNftFractionalised;
    mapping(ERC721 => mapping(uint => address)) fractionTokenAddressFromNft;
    mapping(baseFractionToken => address) nftAddressFromFraction;
    mapping(baseFractionToken => uint) nftIdFromFraction;

    address contractDeployer;

    constructor() {
        depositsMade = 0;
        contractDeployer = msg.sender;
    }

    modifier contractDeployerOnly {
        require (msg.sender == contractDeployer, "Only contract deployer can call this function");
        _;
    }
    
    function setNftOwner(ERC721 _nft, uint _nftId, address newOwner) public {
        require(isNftChangingOwner[_nft][_nftId] == true, "Nft is not changing owner");
        require(msg.sender == nftOwner[_nft][_nftId], "Only current owner of NFT can change NFT owner");
        
        isNftChangingOwner[_nft][_nftId] = false;
        nftOwner[_nft][_nftId] = newOwner;
    }

    function isNftActive(ERC721 _Nft, uint _nftId) public view returns(bool) {
        bool hasDeposited = hasNftDeposited[_Nft][_nftId];
        bool hasFractionalise = hasNftFractionalised[_Nft][_nftId];
        if (hasDeposited && hasFractionalise) {
            return true;
        } else {
            return false;
        }
    }

    function depositNft(address _NftContractAddress, uint256 _NftId) public {
        // this contract must be approved first

        ERC721 Nft = ERC721(_NftContractAddress);
        Nft.safeTransferFrom(msg.sender, address(this), _NftId);
    
        isNftDeposited[Nft][NftId] = true;
        nftOwner[Nft][NftId] = msg.sender;
        canNftBeWithdrawn[Nft][NftId] = msg.sender;
    }

    function createFraction(
        address _nftContractAddress,
        uint256 _nftId,
        uint256 _royaltyPercentage,
        uint256 _supply,
        string memory _tokenName,
        string memory _tokenTicker
    ) public {
        ERC721 nft = ERC721(_nftContractAddress);
        require(isNftDeposited[nft][_nftId], "This NFT hasn't been deposited yet");
        require(nftOwner[nft][_nftId] == msg.sender, "You do not own this NFT");

        isNftFractionalised[nft][_nftId] = true;

        baseFractionToken FractionToken = new baseFractionToken(_nft,
                                                                _nftId,
                                                                msg.sender,
                                                                _tokenName,
                                                                _tokenTicker,
                                                                _supply,                                                                
                                                                _royaltyPercentage,
                                                                address (this)
        );

        fractionTokenAddressFromNft[nft][_nftId] = address (FractionToken);
    }

     function withdrawNft(address _nftContractAddress, uint256 _nftId) public {
        ERC721 nft = ERC721(_nftContractAddress);
        baseFractionToken FractionToken = baseFractionToken(fractionTokenAddressFromNft[_nft][_nftId]);
        
        require(isNftDeposited[nft][_nftId] == true, "This NFT is not withdrawn");
        require(isNftFractionalised[nft][_nftId] == false ||
                FractionToken.balanceOf(msg.sender) == FractionToken.totalSupply(), 
                "NFT cannot be withdrawn, ether the NFT has been withdrawn or you do not own the total supply of fraction tokens"
                );

        nft.safeTransferFrom(address(this), msg.sender, _nftId);
    }
    
    function getNftOwner(ERC721 _nft, uint _nftId) public view returns(address) {
        return nftOwner[_nft][_nftId];
    }
    function getIsChangingNftOwner(ERC721 _nft, uint _nftId) public view returns(bool) {
        return isNftChangingOwner[_nft][_nftId];
    }
    function getFractionTokenAddressFromNft(ERC721 _nft, uint _nftId) public view returns(address) {
        return fractionTokenAddressFromNft[_nft][_nftId];
    }
    function getNftIdFromFraction(baseFractionToken _fractionToken) public view returns (uint) {
        return nftIdFromFraction[_fractionToken];
    }
    
    function getNftAddressFromFraction(baseFractionToken _fractionToken) public view returns(address) {
        return nftAddressFromFraction[_fractionToken];
    }

    function getIsNftDeposited(ERC721 _nft, uint _nftId) public view returns (bool) {
        return isNftDeposited[_nft][_nftId];
    }

    function getIsNftFractionalised(ERC721 _nft, uint _nftId) public view returns (bool) {
        return isNftFractionalised[_nft][_nftId];
    }

    function getNftFractionSupply(ERC721 _nft, uint _nftId) public view returns(uint) {
        return nftFractionSupply[_nft][_nftId];
    }

    function setIsNftChangingOwnerTrue(ERC721 _nft, uint _nftId) public {
        require(msg.sender == nftOwner[_nft][_nftid], "You are not the owner of this NFT");
        isNftChangingOwner[_nft][_nftId] = true;
    }

    function onERC721Received(
        address,
        address from,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        // require(from == address(), "Cannot send nfts to Vault dirrectly");
        
        return IERC721Receiver.onERC721Received.selector;
    }
}
