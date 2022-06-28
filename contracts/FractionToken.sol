pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract baseFractionToken is  ERC20,  ERC20Burnable {
    address NFTOwner;
    address StorageContractAddress;
    address AuctionContractAddress;
    uint RoyaltyPercentage;

    address NftAddress;
    uint NftId;

    address[] tokenOwners;

    bool internal noLongerFractionToken;
    mapping(address => bool) isHolding;

    constructor(address _nftAddress, uint _nftId, address _nftOwner, string memory _tokenName, string memory _tokenTicker, uint _supply, uint _royaltyPercentage, address _storageContractAddress) ERC20(_tokenName, _tokenTicker) {
        NftAddress = _nftAddress;
        NftId = _nftId;
        NFTOwner = _nftOwner;
        RoyaltyPercentage = _royaltyPercentage;
        _mint(NFTOwner, _supply);
        StorageContractAddress = _storageContractAddress;
        noLongerFractionToken = false;
    }


    function _transferWithRoyalty(address _from, address _to, uint256 _amount) public {
        uint royaltyFee = getRoyaltyFee(_amount);
        uint afterRoyaltyFee = _amount - royaltyFee;

        _transfer(_from, NFTOwner, royaltyFee);
        _transfer(_from, _to, afterRoyaltyFee);
    }

    function transfer(address to, uint256 amount) override public returns (bool) {
        address owner = _msgSender();

        if(_msgSender() != AuctionContractAddress ||
            to != AuctionContractAddress) {
            
            _transferWithRoyalty(owner, to, amount);
        } else {
            _transfer(owner, NFTOwner, amount);
        }

        addNewUserRemoveOld(to, owner);
        
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);

        if (_msgSender() != AuctionContractAddress ||
        to != AuctionContractAddress) {

        _transferWithRoyalty(from, to, amount);
        }  else {
        _transfer(from, to, amount);
        }

        addNewUserRemoveOld(to, from);

        return true;
    }

    function burn(uint256 amount) public virtual override {
        _burn(_msgSender(), amount);
    }

    function setNoLongerFractionTokenTrue() public {
        require(msg.sender == StorageContractAddress, "This function can only be called from the storage contract");
        noLongerFractionToken = true;
    }

    function addNewUserRemoveOld(address newUser, address oldUser) public{
        tokenOwners.push(newUser);
        isHolding[newUser] = true;

        if (isHolding[oldUser] == true &&
            balanceOf(oldUser) == 0 ) {
            
            for (uint i = 0; i < tokenOwners.length; i++) {
                if (tokenOwners[i] == oldUser) {

                    delete tokenOwners[i];
                    isHolding[oldUser] = false;
                    break;
                }
            }
        }
    }

    function setAuctionContractAddress(address _address) public {
    require(msg.sender == StorageContractAddress, "only storage contract can update this");

    AuctionContractAddress = _address;
    }

    function updateNFTOwner(address _newOwner) public {
        require(msg.sender == StorageContractAddress, "only storage contract can update this");

        NFTOwner = _newOwner;
    }
    
    function getRoyaltyFee(uint _amount) public view returns(uint) {
        return _amount * RoyaltyPercentage / 100;
    }

    function getRoyaltyPercentage() public view returns(uint) {
        return RoyaltyPercentage;
    }
    
    function getNftOwner() public view returns(address) {
        return NFTOwner;
    }

    function getNoLongerFractionToken() public view returns(bool) {
        return noLongerFractionToken;
    }

    function getNftAddress() public view returns(address) {
        return NftAddress;
    }

    function getNftId() public view returns(uint) {
        return NftId;
    }

    function returnTokenOwners() public view returns(address[] memory) {
        return tokenOwners;
    }
}
