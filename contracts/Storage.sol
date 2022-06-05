pragma solidity 0.8.14;
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import './FractionToken.sol';

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MainContract is IERC721Receiver {
    //mapping(address => CurrentDepositedNFTs) nftDeposits;
    //struct CurrentDepositedNFTs {
    //    NFTDeposit[] deposits;
    //}
    //struct NFTDeposit {
    //    address owner;
    //    address NFTContractAddress;
    //    ERC721 NFT;
    //    uint256 supply;
    //    uint256 nftId;
    //    uint256 depositTimestamp;
    //    address fractionContractAddress;
    //    baseFractionToken fractionToken;
    //    bool hasFractionalised;
    //    bool canWithdraw;
    //    bool isChangingOwnership;
    //}
    mapping(ERC721 => mapping(uint => bool)) isNftDeposited;
    mapping(ERC721 => mapping(uint => address)) nftOwner;
    mapping(ERC721 => mapping(uint => bool)) isNftChangingOwner;
    mapping(ERC721 => mapping(uint => bool)) canNftBeWithdrawn;
    
    mapping(ERC721 => mapping(uint => bool)) isNftFractionalised;
    mapping(ERC721 => mapping(uint => uint)) nftFractionSupply;
    mapping(ERC721 => mapping(uint => address)) fractionTokenAddressFromNft;
    mapping(baseFractionToken => address) nftAddressFromFraction;
    mapping(baseFractionToken => uint) nftIdFromFraction;

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
        
    function setNftOwner(ERC721 _nft, uint _nftId, address newOwner) public {
        require(isNftChangingOwner[_nft][_nftId] == true, "Nft is not changing owner");
        require(msg.sender == nftOwner[_nft][_nftId], "Only current owner of NFT can change NFT owner");
        
        isNftChangingOwner[_nft][_nftId] = false;
        nftOwner[_nft][_nftId] = newOwner;
    }

    address contractDeployer;

    constructor() {
        depositsMade = 0;
        contractDeployer = msg.sender;
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

    modifier contractDeployerOnly {
        require (msg.sender == contractDeployer, "Only contract deployer can call this function");
        _;
    }

    //UNDER HERE HASN'T BEEN EDITED
    //
    //
    //
    //
    function depositNft(address _NFTContractAddress, uint256 _tokenId) public {

        NFTDeposit memory newInfo;
        newInfo.NFT = ERC721(_NFTContractAddress);
        //require(newInfo.NFT.ownerOf(_tokenId) == msg.sender, "You do not own this NFT");
        //can this be reentrency
        newInfo.NFT.safeTransferFrom(msg.sender, address(this), _tokenId);
        newInfo.NFTContractAddress = _NFTContractAddress;
        newInfo.owner = msg.sender;
        newInfo.tokenId = _tokenId;
        newInfo.depositTimestamp = block.timestamp;
        newInfo.hasFractionalised = false;
        newInfo.canWithdraw = true;
        nftDeposits[msg.sender].deposits.push(newInfo);
        hasNftDeposited[newInfo.NFT] = true;
        lastAddress = msg.sender;
    }

    address nftContractAddress;
    address inputContractAddress;

    uint tokenId;
    uint inputTokenId;

    address ownerOf;
    address msgsender;

    function createFraction(
        address _NFTContractAddress,
        uint256 _tokenId,
        uint256 _royaltyPercentage,
        uint256 _supply,
        string memory _tokenName,
        string memory _tokenTicker
    ) public {
        for (uint256 i = 0; i < nftDeposits[msg.sender].deposits.length; i++) {
            //if correct nft to createFraction and we are the owner

            if (nftDeposits[msg.sender].deposits[i].NFTContractAddress ==
                _NFTContractAddress &&
                nftDeposits[msg.sender].deposits[i].tokenId == _tokenId &&
                nftDeposits[msg.sender].deposits[i].owner == msg.sender) 
            {

                baseFractionToken fractionToken = new baseFractionToken(
                    msg.sender,
                    _royaltyPercentage,
                    _supply,
                    _tokenName,
                    _tokenTicker,
                    address (this)
                );
                nftDeposits[msg.sender].deposits[i].hasFractionalised = true;
                nftDeposits[msg.sender].deposits[i].fractionToken = fractionToken;
                nftDeposits[msg.sender].deposits[i].fractionContractAddress = address(fractionToken);
                hasNftFractionalised[nftDeposits[msg.sender].deposits[i].NFT] = true;
                nftFromToken[nftDeposits[msg.sender].deposits[i].fractionToken] = nftDeposits[msg.sender].deposits[i].NFT;
                break;
            }
        }
    }

     function withdrawNft(address _NFTContractAddress, uint256 _tokenId, baseFractionToken _TokenContractAddress) public {
        CurrentDepositedNFTs memory userDeposits = nftDeposits[msg.sender];
        
        for (uint256 i = 0; i < nftDeposits[msg.sender].deposits.length; i++) {
            if (nftDeposits[msg.sender].deposits[i].NFTContractAddress == _NFTContractAddress &&
                nftDeposits[msg.sender].deposits[i].tokenId == _tokenId) {
                    uint totalSupply = _TokenContractAddress.totalSupply();

                    if (userDeposits.deposits[i].hasFractionalised == false||
                        _TokenContractAddress.balanceOf(msg.sender) == totalSupply)
                        {
                            nftDeposits[msg.sender].deposits[_tokenId].NFT.safeTransferFrom(address(this), msg.sender, _tokenId);
                            break;
                        }
                }
        }
    }

    function getNftFromDeposits(address _NftContractAddress, uint _NftId) public view returns (ERC721) {
        for (uint256 i = 0; i < nftDeposits[msg.sender].deposits.length; i++) {
        if (nftDeposits[msg.sender].deposits[i].NFTContractAddress == _NftContractAddress &&
            nftDeposits[msg.sender].deposits[i].tokenId == _NftId) {
                return nftDeposits[msg.sender].deposits[i].NFT;
                break;
            }
        }
    }

    function getFractionContractAddress(address _address, uint _depositIndex) public view returns (address) {
        return nftDeposits[_address].deposits[_depositIndex].fractionContractAddress;
    }

    function getNftDeposit(address _address) public view returns (NFTDeposit[] memory) {
        return nftDeposits[_address].deposits;
    }

    function getLastFractionId(address _address) public view returns(uint) {
        return nftDeposits[_address].deposits.length;
    }

    function searchForFractionToken(address _NFTContractAddress, uint256 _tokenId) public view returns(baseFractionToken) {
         for (uint256 i = 0; i < nftDeposits[msg.sender].deposits.length; i++) {
            if (nftDeposits[msg.sender].deposits[i].NFTContractAddress == _NFTContractAddress &&
                nftDeposits[msg.sender].deposits[i].tokenId == _tokenId) {
                    return nftDeposits[msg.sender].deposits[i].fractionToken;
                }
         }
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