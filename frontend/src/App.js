import './App.css';
import React from 'react';
import Navbar from './Navbar';
import FractionNFT from './Pages/FractionNFT';
import MintNFT from './Pages/MintNFT';
import WithdrawNFT from './Pages/WithdrawNFT';
import Trade from './Pages/Trade'
import Home from './Pages/Home';
import CreateProposal from './Pages/Withdraw/CreateProposal';
import ActiveProposals from './Pages/Withdraw/ActiveProposals';
import ActiveAuctions from './Pages/Withdraw/ActiveAuctions';
import ProposalWallet from './Pages/Withdraw/ProposalWallet';
import YourFractionedNFTsWallet from './Pages/YourFractionedNFTsWallet';
import YourFractionedNFTs from './Pages/YourFractionedNFTs';
import Withdraw from './Pages/Withdraw/Withdraw';
import Stake from './Pages/Withdraw/Stake';
import StakeWallet from './Pages/Withdraw/StakeWallet';
import FractionaliseWallet from './FractionNFT/FractionaliseWallet';
import ManualFractionalise from './FractionNFT/ManualFractionalise';

import CreateFraction from './FractionNFT/CreateFraction';
import CreatePool from './Pages/Trade/CreatePool';

import { Route, Routes } from "react-router-dom";

export const RinkebyStorageAddress = "0x6f06712c5CB637D71d26B0e639cD8689779D03F0"
export const RinkebyAuctionAddress = "0x4802BacAd2cAcF01A699f6E27e06C0f37E294588"
export const RinkebyNftAddress = "0x086B35a4047A1a7ea43a5bdFa253b9E16D73430D"

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/MintNFT" element={<MintNFT />} />
          <Route path="/FractionNFT" element={<FractionNFT />} />
          <Route path="/WithdrawNFT" element={<WithdrawNFT />} />
          <Route path="/Trade" element={<Trade />} />
          <Route path="/CreateProposal" element={<CreateProposal />} />
          <Route path="/ActiveProposals" element={<ActiveProposals />} />
          <Route path="/ActiveAuctions" element={<ActiveAuctions />} />
          <Route path="/ProposalWallet" element={<ProposalWallet />} />
          <Route path="/Withdraw" element={<Withdraw />} />
          <Route path="/FractionaliseWallet" element={<FractionaliseWallet />} />
          <Route path="/YourFractionedNFTs" element={<YourFractionedNFTs />} />
          <Route path="/YourFractionedNFTsWallet" element={<YourFractionedNFTsWallet />} />
          <Route path="/ManualFractionalise" element={<ManualFractionalise />} />
          <Route path="/CreateFraction" element={<CreateFraction />} />
          <Route path="/CreatePool" element={<CreatePool /> } />
          <Route path="/Stake" element={<Stake /> } />
          <Route path="/StakeWallet" element={<StakeWallet /> } />

        </Routes>
      </div>
    </>
  )
}

export default App;
