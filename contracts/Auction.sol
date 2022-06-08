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

          //fraction         //user
    mapping(address => mapping(address => uint)) tokenBalances;

    mapping(address => mapping(uint => bool)) isNftInProposal;
    mapping(address => mapping(uint => uint)) nftProposalStartPrice;
    mapping(address => mapping(uint => address)) proposalInitiator;
    mapping(address => mapping(uint => uint)) proposalFinishTime;
    mapping(address => mapping(uint => uint)) totalVoted;
    mapping(address => mapping(uint => uint)) score;

    mapping(address => mapping(uint => bool)) isNftInAuction;
    mapping(address => mapping(uint => uint)) auctionCurrentBid;
    mapping(address => mapping(uint => address)) auctionCurrentLeader;
    mapping(address => mapping(uint => uint)) auctionFinishTime;
    mapping(baseFractionToken => uint) pricePerToken;

    mapping(address => mapping(uint => mapping(address => uint))) ethInContract;
    mapping(address => mapping(uint => mapping(address => bool))) canWithdrawEthInContract;

    mapping(baseFractionToken => ERC721) TokensForNFT;
    //mapping (address => mapping(uint => bool)) hasVotedInProposal;
    mapping (address => mapping(uint => bool)) voteValueInProposal;
    mapping (address => mapping(uint => bool)) hasVotedInAuction;
    mapping (address => mapping(uint => bool)) voteValueInAuction;

   function stakeTokens(address _fractionAddress, uint _amount) public {
        //user needs to approve this contract to send its tokens

        baseFractionToken FractionToken = baseFractionToken(_fractionAddress);

        address nftAddress = FractionToken.getNftAddress();
        uint nftId = FractionToken.getNftId();

        require(storageContract.isNftActive(nftAddress, nftId) == true, "tokens do not have an active NFT");
        require(_amount <= FractionToken.balanceOf(msg.sender), "you dont have enough tokens");

        FractionToken.transferFrom(msg.sender, address(this), _amount);
        tokenBalances[_fractionAddress][msg.sender] += _amount;
        
   }

    function unstakeTokens(address _fractionAddress, uint _amount) public {
        baseFractionToken FractionToken = baseFractionToken(_fractionAddress);

        address nftAddress = FractionToken.getNftAddress();
        uint nftId = FractionToken.getNftId();

        require(storageContract.getIsNftFractionalised(nftAddress, nftId) == true, "NFT is not fractionalise");
        require(isNftInProposal[nftAddress][nftId] == false, "NFT is in proposal");
        require(isNftInAuction[nftAddress][nftId] == false, "NFT is in auction");
        require(_amount <= tokenBalances[_fractionAddress][msg.sender], "you dont have enough tokens staked");
    
        FractionToken.transfer(msg.sender, _amount);
        tokenBalances[_fractionAddress][msg.sender] -= _amount;
    }

    function startProposal(address _nftAddress , uint _nftId, uint _startPrice, uint _time, uint _stakeAmount) public{
        require(storageContract.getNftOwner(_nftAddress, _nftId) == msg.sender);
        require(storageContract.getIsNftFractionalised(_nftAddress, _nftId) == true, "This NFT is not fractionalise");
        
        address FractionTokenAddress = storageContract.getFractionAddressFromNft(_nftAddress, _nftId);
        baseFractionToken FractionToken = baseFractionToken(FractionTokenAddress);
        require(_stakeAmount <= tokenBalances[FractionTokenAddress][msg.sender], "You do not have enough tokens staked");
        
        isNftInProposal[_nftAddress][_nftId] = true;
        proposalInitiator[_nftAddress][_nftId] = msg.sender;
        nftProposalStartPrice[_nftAddress][_nftId] = _startPrice;

        if (_time == 0) {
        proposalFinishTime[_nftAddress][_nftId] = block.timestamp + DEFAULT_WAIT_TIME;
        } else {
        proposalFinishTime[_nftAddress][_nftId] = block.timestamp + _time;
        }

        totalVoted[_nftAddress][_nftId] = _stakeAmount;
        score[_nftAddress][_nftId] = totalVoted[_nftAddress][_nftId];
    }

    function voteOnProposal(address _nftAddress, uint _nftId, bool _voteValue, uint _voteAmount) public {
        address FractionTokenAddress = storageContract.getFractionAddressFromNft(_nftAddress, _nftId);
        baseFractionToken FractionToken = baseFractionToken(FractionTokenAddress);

        require(isNftInProposal[_nftAddress][_nftId] == true, "There is no proposal active for this NFT");
        require (_voteAmount <= tokenBalances[FractionTokenAddress][msg.sender], "You don't have enough tokens staked");

        if (block.timestamp < proposalFinishTime[_nftAddress][_nftId]) {
            totalVoted[_nftAddress][_nftId] += _voteAmount;

            if (_voteValue == true) {
                score[_nftAddress][_nftId] += _voteAmount;
            } else {
                score[_nftAddress][_nftId] -= _voteAmount;
            }
        }

        uint supply = FractionToken.totalSupply();
          // percentage agree
        if(totalVoted[_nftAddress][_nftId] >= supply/2) {
            if (score[_nftAddress][_nftId] >= supply/2) {
                startAuction(_nftAddress, _nftId, proposalFinishTime[_nftAddress][_nftId]);

                isNftInProposal[_nftAddress][_nftId] = false;
                proposalFinishTime[_nftAddress][_nftId] = 0;
                totalVoted[_nftAddress][_nftId] = 0;
                score[_nftAddress][_nftId] = 0;

            } else {
                isNftInProposal[_nftAddress][_nftId] = false;
                proposalFinishTime[_nftAddress][_nftId] = 0;
                totalVoted[_nftAddress][_nftId] = 0;
                score[_nftAddress][_nftId] = 0;
                proposalInitiator[_nftAddress][_nftId] = 0x000000000000000000000000000000000000dEaD;
            }
        }
    }

    function startAuction(address _nftAddress, uint _nftId, uint _auctionTime) public {
        require(_auctionTime < block.timestamp + DEFAULT_WAIT_TIME, "Set auction time lower than max");

        auctionFinishTime[_nftAddress][_nftId] = _auctionTime;

        isNftInAuction[_nftAddress][_nftId] = true;

        auctionCurrentBid[_nftAddress][_nftId] = nftProposalStartPrice[_nftAddress][_nftId];
        nftProposalStartPrice[_nftAddress][_nftId] = 0;

        auctionCurrentLeader[_nftAddress][_nftId] = proposalInitiator[_nftAddress][_nftId];
        proposalInitiator[_nftAddress][_nftId] = 0x000000000000000000000000000000000000dEaD;
    }

    function bidOnAuction(address _nftAddress, uint _nftId) public payable {
        require(isNftInProposal[_nftAddress][_nftId] == false, "Proposal for NFT is still active");
        require(isNftInAuction[_nftAddress][_nftId] == true, "Auction not active for this NFT");
        require (msg.value > auctionCurrentBid[_nftAddress][_nftId], "Your bid was less than the current bid");
        
        baseFractionToken FractionToken = baseFractionToken(storageContract.getFractionAddressFromNft(_nftAddress, _nftId));

        if (block.timestamp < auctionFinishTime[_nftAddress][_nftId]) { 
            
            canWithdrawEthInContract[_nftAddress][_nftId][auctionCurrentLeader[_nftAddress][_nftId]] = true;

            canWithdrawEthInContract[_nftAddress][_nftId][msg.sender] = false;
            auctionCurrentLeader[_nftAddress][_nftId] = msg.sender;
            auctionCurrentBid[_nftAddress][_nftId] = msg.value;
            ethInContract[_nftAddress][_nftId][msg.sender] = msg.value;
            
        } else {
            isNftInAuction[_nftAddress][_nftId] = false;
            pricePerToken[FractionToken] = auctionCurrentBid[_nftAddress][_nftId] / FractionToken.totalSupply();
            applyWinnings(_nftAddress, _nftId);
       }
    }

    function updateNftOwner(address _nftAddress, uint _nftId, address _newOwner) public {
        address(storageContract).delegatecall(abi.encodeWithSignature("setIsNftChangingOwner", _nftAddress, _nftId));
        address(storageContract).delegatecall(abi.encodeWithSignature("SetNftOwner", _nftAddress, _nftId, _newOwner));
    }

    function applyWinnings(address _nftAddress, uint _nftId) internal {
        storageContract.setIsNftChangingOwnerTrue(_nftAddress, _nftId);
        storageContract.setNftOwner(_nftAddress, _nftId, auctionCurrentLeader[_nftAddress][_nftId]);
        baseFractionToken FractionToken = baseFractionToken(storageContract.getFractionAddressFromNft(_nftAddress, _nftId));

        FractionToken.setNoLongerFractionTokenTrue();
    }

    function claimFromBuyoutTokens(address FractionTokenAddress) public  {
        baseFractionToken FractionToken = baseFractionToken(FractionTokenAddress);
        require(FractionToken.getNoLongerFractionToken() == true, "This token is still active as a fraction token for an NFT");

        uint balance = tokenBalances[FractionTokenAddress][msg.sender] + FractionToken.balanceOf(msg.sender);
        require(balance > 0, "You have 0 tokens");

        //contact must be approved

        FractionToken.transferFrom(msg.sender, address (this), FractionToken.balanceOf(msg.sender));

        FractionToken.burn(balance);
        payable(msg.sender).transfer(pricePerToken[FractionToken] * balance);
    }

    function getTimestamp() public view returns(uint) {
        return block.timestamp;
    }

    function getAddressTokenBalance(address _fractionTokenAddress, address _user) public view returns(uint){
        return tokenBalances[_fractionTokenAddress][_user];
    }

    function getIsNftInProposal(address _nftAddress, uint _nftId) public view returns (bool) {
        return isNftInProposal[_nftAddress][_nftId];
    }

    function getProposalStartPrice(address _nftAddress, uint _nftId) public view returns (uint) {
        return nftProposalStartPrice[_nftAddress][_nftId];
    }
    
    function getProposalInitiator(address _nftAddress, uint _nftId) public view returns (address) {
        return proposalInitiator[_nftAddress][_nftId];
    }

    function getProposalFinishTime(address _nftAddress, uint _nftId) public view returns (uint) {
        return proposalFinishTime[_nftAddress][_nftId];
    }

    function getProposalTotalVoted(address _nftAddress, uint _nftId) public view returns (uint) {
        return totalVoted[_nftAddress][_nftId];
    }

    function getProposalScore(address _nftAddress, uint _nftId) public view returns (uint) {
        return score[_nftAddress][_nftId];
    }

    function getIfNftIsInAuction(address _nftAddress, uint _nftId) public view returns (bool) {
        return isNftInAuction[_nftAddress][_nftId];
    }
}

