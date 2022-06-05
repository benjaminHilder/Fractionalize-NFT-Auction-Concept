//UNDER DEVELOPNMENT
pragma solidity 0.8.14;
import './FractionToken.sol';
import './Storage.sol';

contract Auction {
    uint DEFAULT_WAIT_TIME = 259200; // 3 days;

    enum Action{Proposal, Auction}

    Storage storageContract;

    constructor(address _storageContractAddress) {
        storageContract = Storage(_storageContractAddress);
    }

    mapping(baseFractionToken => mapping(address => uint)) tokenBalances;

    mapping(ERC721 => mapping(uint => bool)) isNftInProposal;
    mapping(ERC721 => mapping(uint => uint)) nftProposalStartPrice;
    mapping(ERC721 => mapping(uint => address)) proposalInitiator;
    mapping(ERC721 => mapping(uint => uint)) proposalFinishTime;
    mapping(ERC721 => mapping(uint => uint)) totalVoted;
    mapping(ERC721 => mapping(uint => uint)) score;

    mapping(ERC721 => mapping(uint => bool)) isNftInAuction;
    mapping(ERC721 => mapping(uint => uint)) auctionCurrentBid;
    mapping(ERC721 => mapping(uint => address)) auctionCurrentLeader;
    mapping(ERC721 => mapping(uint => uint)) auctionFinishTime;
    mapping(baseFractionToken => uint) pricePerToken;

    mapping(ERC721 => mapping(uint => mapping(address => uint))) ethInContract;
    mapping(ERC721 => mapping(uint => mapping(address => bool))) canWithdrawEthInContract;

    mapping(baseFractionToken => ERC721) TokensForNFT;
    //mapping (address => mapping(uint => bool)) hasVotedInProposal;
    mapping (address => mapping(uint => bool)) voteValueInProposal;
    mapping (address => mapping(uint => bool)) hasVotedInAuction;
    mapping (address => mapping(uint => bool)) voteValueInAuction;

   function stakeTokens(baseFractionToken _fractionToken, uint _amount) public {
        //user needs to approve this contract to send its tokens

        ERC721 nft = _fractionToken.getNft();
        uint nftId = _fractionToken.getNftId();

        require(storageContract.isNftActive(nft, nftId) == true, "tokens do not have an active NFT");
        require(_fractionToken.balanceOf(msg.sender) <= _amount && _amount > 0, "you dont have enough tokens");

        tokenBalances[_fractionToken][msg.sender] += _amount;
        _fractionToken.transferFrom(msg.sender, address(this), _amount);
   }

    function unstakeTokens(address _fractionTokenAddress, uint _amount) public {
        baseFractionToken FractionToken = baseFractionToken(_fractionTokenAddress);
        ERC721 Nft = FractionToken.getNft();
        uint NftId = FractionToken.getNftId();

        require(storageContract.getIsNftFractionalised(Nft, NftId), "NFT is not fractionalise");
        require(isNftInProposal[Nft][NftId] == false, "NFT is in proposal");
        require(isNftInAuction[Nft][NftId] == false, "NFT is in auction");
        require(tokenBalances[FractionToken][msg.sender] <= _amount, "you dont have enough tokens");
    
        tokenBalances[FractionToken][msg.sender] -= _amount;
        FractionToken.transfer(msg.sender, _amount);
    }

    function updateNftOwner(ERC721 _Nft, uint _NftId, address _newOwner) public {
        
        address(storageContract).delegatecall(abi.encodeWithSignature("setIsNftChangingOwner", _Nft, _NftId));
        address(storageContract).delegatecall(abi.encodeWithSignature("SetNftOwner", _Nft, _NftId, _newOwner));
    }

    function startProposal(ERC721 _nft, uint _nftId, uint _startPrice, uint _stakeAmount) public{
        require(storageContract.getNftOwner(_nft, _nftId) == msg.sender);
        require(storageContract.getIsNftFractionalised(_nft, _nftId) == true, "This NFT is not fractionalise");
        
        baseFractionToken FractionToken = baseFractionToken(storageContract.getFractionAddressFromNft(_nft, _nftId));
        require(FractionToken.balanceOf(msg.sender) <= _stakeAmount, "Your vote amount was too large");
        
        isNftInProposal[_nft][_nftId] = true;
        proposalInitiator[_nft][_nftId] = msg.sender;
        nftProposalStartPrice[_nft][_nftId] = _startPrice;
        proposalFinishTime[_nft][_nftId] = block.timestamp + DEFAULT_WAIT_TIME;

        stakeTokens(FractionToken, _stakeAmount);
        totalVoted[_nft][_nftId] = _stakeAmount;
        score[_nft][_nftId] = totalVoted[_nft][_nftId];
    }

    function voteOnProposal(ERC721 _nft, uint _nftId, bool _voteValue, uint _voteAmount) public {
        baseFractionToken FractionToken = baseFractionToken(storageContract.getFractionAddressFromNft(_nft, _nftId));

        require(isNftInProposal[_nft][_nftId] == true, "There is no proposal active for this NFT");
        require (FractionToken.balanceOf(msg.sender) <= _voteAmount, "You don't own enough tokens");

        if (block.timestamp < proposalFinishTime[_nft][_nftId]) {
           
            stakeTokens(FractionToken, _voteAmount);
            
                totalVoted[_nft][_nftId] += _voteAmount;
            if (_voteValue == true) {
                score[_nft][_nftId] += _voteAmount;
            } else {
                score[_nft][_nftId] -= _voteAmount;
            }
        }

        uint supply = FractionToken.totalSupply();
          // percentage agree
        if(totalVoted[_nft][_nftId] >= supply/2) {
            if (score[_nft][_nftId] >= supply/2) {
                startAuction(_nft, _nftId, proposalFinishTime[_nft][_nftId]);

                isNftInProposal[_nft][_nftId] = false;
                proposalFinishTime[_nft][_nftId] = 0;
                totalVoted[_nft][_nftId] = 0;
                score[_nft][_nftId] = 0;

            } else {
                isNftInProposal[_nft][_nftId] = false;
                proposalFinishTime[_nft][_nftId] = 0;
                totalVoted[_nft][_nftId] = 0;
                score[_nft][_nftId] = 0;
                proposalInitiator[_nft][_nftId] = 0x000000000000000000000000000000000000dEaD;
            }
        }
    }

    function startAuction(ERC721 _nft, uint _nftId, uint _auctionTime) public {
        require(_auctionTime < DEFAULT_WAIT_TIME, "Set auction time lower than max");

        auctionFinishTime[_nft][_nftId] = _auctionTime;

        isNftInAuction[_nft][_nftId] = true;

        auctionCurrentBid[_nft][_nftId] = nftProposalStartPrice[_nft][_nftId];
        nftProposalStartPrice[_nft][_nftId] = 0;

        auctionCurrentLeader[_nft][_nftId] = proposalInitiator[_nft][_nftId];
        proposalInitiator[_nft][_nftId] = 0x000000000000000000000000000000000000dEaD;
    }

    function bidOnAuction(ERC721 _nft, uint _nftId) public payable {
        require(isNftInProposal[_nft][_nftId] == false, "Proposal for NFT is still active");
        require(isNftInAuction[_nft][_nftId] == true, "Auction not active for this NFT");
        require (msg.value > auctionCurrentBid[_nft][_nftId], "Your bid was less than the current bid");
        
        baseFractionToken FractionToken = baseFractionToken(storageContract.getFractionAddressFromNft(_nft, _nftId));

        if (block.timestamp < auctionFinishTime[_nft][_nftId]) { 
            
            canWithdrawEthInContract[_nft][_nftId][auctionCurrentLeader[_nft][_nftId]] = true;

            canWithdrawEthInContract[_nft][_nftId][msg.sender] = false;
            auctionCurrentLeader[_nft][_nftId] = msg.sender;
            auctionCurrentBid[_nft][_nftId] = msg.value;
            ethInContract[_nft][_nftId][msg.sender] = msg.value;
            
        } else {
            isNftInAuction[_nft][_nftId] = false;
            pricePerToken[FractionToken] = auctionCurrentBid[_nft][_nftId] / FractionToken.totalSupply();
            applyWinnings(_nft, _nftId);
       }
    }

    function applyWinnings(ERC721 _nft, uint _nftId) internal {
        storageContract.setIsNftChangingOwnerTrue(_nft, _nftId);
        storageContract.setNftOwner(_nft, _nftId, auctionCurrentLeader[_nft][_nftId]);
        baseFractionToken FractionToken = baseFractionToken(storageContract.getFractionAddressFromNft(_nft, _nftId));

        FractionToken.setNoLongerFractionTokenTrue();
    }

    function claimFromBuyoutTokens(address FractionTokenAddress) public  {
        baseFractionToken FractionToken = baseFractionToken(FractionTokenAddress);
        require(FractionToken.getNoLongerFractionToken() == true, "This token is still active as a fraction token for an NFT");

        uint balance = tokenBalances[FractionToken][msg.sender] + FractionToken.balanceOf(msg.sender);
        require(balance > 0, "You have 0 tokens");

        //contact must be approved

        FractionToken.transferFrom(msg.sender, address (this), FractionToken.balanceOf(msg.sender));

        FractionToken.burn(balance);
        payable(msg.sender).transfer(pricePerToken[FractionToken] * balance);
    }
}

