pragma solidity 0.8.13;
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import './FractionToken.sol';

contract Storage is IERC721Receiver {
    mapping(address => mapping(uint => bool)) isNftDeposited;
    mapping(address => mapping(uint => address)) nftOwner;
    mapping(address => mapping(uint => bool)) isNftChangingOwner;

    mapping(address => mapping(uint => bool)) isNftFractionalised;
    mapping(address => mapping(uint => address)) fractionTokenAddressFromNft;
    mapping(baseFractionToken => address) nftAddressFromFraction;
    mapping(baseFractionToken => uint) nftIdFromFraction;

    struct DepositedNftInfo {
        address nftAddress;
        uint256 nftId;
    }

    mapping(address => nftDepositFolder) depositFolder;

    struct nftDepositFolder {
        DepositedNftInfo[] deposits;
    }

    address contractDeployer;
    address auctionAddress;

    constructor() {
        contractDeployer = msg.sender;
    }

    modifier contractDeployerOnly {
        require (msg.sender == contractDeployer, "Only contract deployer can call this function");
        _;
    }

    modifier auctionContractOnly {
        require(msg.sender == auctionAddress,"only auction can call this function");
        _;
    }
    
    function setNftOwner(address _nftAddress, uint _nftId, address newOwner) public {
        require(isNftChangingOwner[_nftAddress][_nftId] == true, "Nft is not changing owner");
        require(msg.sender == auctionAddress, "Only current owner of NFT can change NFT owner");
        
        isNftChangingOwner[_nftAddress][_nftId] = false;
        nftOwner[_nftAddress][_nftId] = newOwner;
    }

    function isNftActive(address _nftAddress, uint _nftId) public view returns(bool) {
        bool hasDeposited = isNftDeposited[_nftAddress][_nftId];
        bool hasFractionalise = isNftFractionalised[_nftAddress][_nftId];
        if (hasDeposited && hasFractionalise) {
            return true;
        } else {
            return false;
        }
    }

    function depositNft(address _nftAddress, uint256 _nftId) public {
        // this contract must be approved first

        ERC721 nft = ERC721(_nftAddress);
        nft.safeTransferFrom(msg.sender, address(this), _nftId);
    
        isNftDeposited[_nftAddress][_nftId] = true;
        nftOwner[_nftAddress][_nftId] = msg.sender;

        DepositedNftInfo memory newDeposit;
        newDeposit.nftAddress = _nftAddress;
        newDeposit.nftId = _nftId;
        depositFolder[msg.sender].deposits.push(newDeposit);
    }

    function createFraction(
        address _nftAddress,
        uint256 _nftId,
        string memory _tokenName,
        string memory _tokenTicker,
        uint256 _supply,
        uint256 _royaltyPercentage

    ) public {
        require(isNftDeposited[_nftAddress][_nftId], "This NFT hasn't been deposited yet");
        require(nftOwner[_nftAddress][_nftId] == msg.sender, "You do not own this NFT");

        isNftFractionalised[_nftAddress][_nftId] = true;

        baseFractionToken FractionToken = new baseFractionToken(_nftAddress,
                                                                _nftId,
                                                                msg.sender,
                                                                _tokenName,
                                                                _tokenTicker,
                                                                _supply,                                                                
                                                                _royaltyPercentage,
                                                                address (this)
        );
        fractionTokenAddressFromNft[_nftAddress][_nftId] = address (FractionToken);
    }

     function withdrawNft(address _nftAddress, uint256 _nftId) public {
        ERC721 nft = ERC721(_nftAddress);
        baseFractionToken FractionToken = baseFractionToken(fractionTokenAddressFromNft[_nftAddress][_nftId]);
        
        require(isNftDeposited[_nftAddress][_nftId] == true, "This NFT is not withdrawn");
        require(isNftFractionalised[_nftAddress][_nftId] == false/* ||
                FractionToken.balanceOf(msg.sender) == FractionToken.totalSupply()*/, 
                "NFT cannot be withdrawn, either the NFT has been withdrawn or you do not own the total supply of fraction tokens"
                );
        require(nftOwner[_nftAddress][_nftId] == msg.sender, "This address does not own this NFT");

        nftOwner[_nftAddress][_nftId] = 0x0000000000000000000000000000000000000000;

        for (uint i = 0; i < depositFolder[msg.sender].deposits.length; i++) {
            if (depositFolder[msg.sender].deposits[i].nftAddress == _nftAddress &&
                depositFolder[msg.sender].deposits[i].nftId == _nftId) {
                delete depositFolder[msg.sender].deposits[i];
                break;
            }
        }

        nft.safeTransferFrom(address(this), msg.sender, _nftId);
    }
    
    function disableIsFractionalised(address _nftAddress, uint _nftID) public auctionContractOnly {
        isNftFractionalised[_nftAddress][_nftID] = false;
    }

    function setAuctionAddress(address _auctionAddress) public contractDeployerOnly {
        auctionAddress = _auctionAddress; 
    }
    
    function setNoLongerFractionTokenTrue(address _nftAddress, uint _nftId) public auctionContractOnly {
        baseFractionToken FractionToken = baseFractionToken(getFractionAddressFromNft(_nftAddress, _nftId));
        FractionToken.setNoLongerFractionTokenTrue();
    }

    function setAuctionAddressInFraction(address _fractionAddress) public {
        baseFractionToken fraction = baseFractionToken(_fractionAddress);

        fraction.setAuctionContractAddress(auctionAddress);
    }

    function getAuctionAddress() public view returns(address) {
        return auctionAddress;
    }
    function getNftOwner(address _nftAddress, uint _nftId) public view returns(address) {
        return nftOwner[_nftAddress][_nftId];
    }
    function getIsChangingNftOwner(address _nftAddress, uint _nftId) public view returns(bool) {
        return isNftChangingOwner[_nftAddress][_nftId];
    }
    function getFractionAddressFromNft(address _nftAddress, uint _nftId) public view returns(address) {
        return fractionTokenAddressFromNft[_nftAddress][_nftId];
    }
    function getNftIdFromFraction(baseFractionToken _fractionToken) public view returns (uint) {
        return nftIdFromFraction[_fractionToken];
    }
    
    function getNftAddressFromFraction(baseFractionToken _fractionToken) public view returns(address) {
        return nftAddressFromFraction[_fractionToken];
    }

    function getIsNftDeposited(address _nftAddress, uint _nftId) public view returns (bool) {
        return isNftDeposited[_nftAddress][_nftId];
    }

    function getIsNftFractionalised(address _nftAddress, uint _nftId) public view returns (bool) {
        return isNftFractionalised[_nftAddress][_nftId];
    }

    function setIsNftChangingOwnerTrue(address _nftAddress, uint _nftId) public {
        require(msg.sender == auctionAddress, "You are not the owner of this NFT");
        isNftChangingOwner[_nftAddress][_nftId] = true;
    }

    function getAddressDepositedNfts(address _address) public view returns(DepositedNftInfo[] memory) {
        return (depositFolder[_address].deposits);
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
