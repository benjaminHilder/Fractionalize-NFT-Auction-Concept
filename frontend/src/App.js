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
import Withdraw from './Pages/Withdraw/Withdraw';
import FractionaliseWallet from './FractionNFT/FractionaliseWallet';
import ManualFractionalise from './FractionNFT/ManualFractionalise';
import CreateFraction from './FractionNFT/CreateFraction';
import CreatePool from './Pages/Trade/CreatePool';

import { Route, Routes } from "react-router-dom";

export const RinkebyStorageAddress = "0x7afd24cf6A16d55A3fcB36Cff5647B6B631781a6"
export const RinkebyAuctionAddress = "0x324addF7A8AE7d0B61296f0943D90430722363bc"
export const RinkebyNftAddress = "0x525616772d59a4A46Bd1Cda9643740Ca9E9B2E65"

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
          <Route path="/ManualFractionalise" element={<ManualFractionalise />} />
          <Route path="/CreateFraction" element={<CreateFraction />} />
          <Route path="/CreatePool" element={<CreatePool /> } />

        </Routes>
      </div>
    </>
  )
}

export default App;
