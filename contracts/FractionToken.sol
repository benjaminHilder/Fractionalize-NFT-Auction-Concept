pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract baseFractionToken is ERC20, ERC20Burnable {
    address NFTOwner;
    address StorageContractAddress;
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

    //function noFeeStorageTransfer(address from, address to, uint amount ) private{
    //    uint royaltyFee = amount * RoyaltyPercentage / 100;
    //    uint afterRoyaltyFee = amount - royaltyFee;
//
    //    if(from != StorageContractAddress ||
    //        to != StorageContractAddress) {
    //        //send royalty
    //        _transfer(from, NFTOwner, royaltyFee);
    //        //send to new owner
    //        _transfer(from, to, afterRoyaltyFee);
    //    } else {
    //        _transfer(from, to, afterRoyaltyFee);
    //    }
    //}

    function transfer(address to, uint256 amount) override public returns (bool) {
        uint royaltyFee = amount * RoyaltyPercentage / 100;
        uint afterRoyaltyFee = amount - royaltyFee;
        
        address owner = _msgSender();
        if(_msgSender() != StorageContractAddress ||
        to != StorageContractAddress) {
            //send royalty
            _transfer(owner, NFTOwner, royaltyFee);
            //send to new owner
            _transfer(owner, to, afterRoyaltyFee);
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

        uint royaltyFee = amount * RoyaltyPercentage / 100;
        uint afterRoyaltyFee = amount - royaltyFee;

        if (_msgSender() != StorageContractAddress ||
        to != StorageContractAddress) {
        //send royalty
        _transfer(from, NFTOwner, royaltyFee);
        //send to new owner
        _transfer(from, to, afterRoyaltyFee);
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

    function updateNFTOwner(address _newOwner) public {
        require(msg.sender == StorageContractAddress, "only storage contract can update this");

        NFTOwner = _newOwner;
    }
    
    function getRoyaltyFee(uint _amount) public view returns(uint) {
        return _amount * RoyaltyPercentage / 100;
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
