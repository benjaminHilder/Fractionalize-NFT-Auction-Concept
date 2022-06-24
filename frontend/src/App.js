import './App.css';
import React from 'react';
import Navbar from './Navbar';
import FractionNFT from './Pages/FractionNFT';
import MintNFT from './Pages/MintNFT';
import WithdrawNFT from './Pages/WithdrawNFT';
import Home from './Pages/Home';
import Proposals from './Pages/Auction/Proposals';
import CreateAuction from './Pages/Auction/CreateAuction';
import ActiveAuction from './Pages/Auction/ActiveAuctions'
import Fractionalise from './FractionNFT/Fractionalise';
import ManualFractionalise from './FractionNFT/ManualFractionalise';
import CreateFraction from './FractionNFT/CreateFraction';

import { Route, Routes } from "react-router-dom";

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
          <Route path="Proposals" element={<Proposals />} />
          <Route path="CreateAuction" element={<CreateAuction />} />
          <Route path="ActiveAuctions" element={<ActiveAuction />} />
          <Route path="Fractionalise" element={<Fractionalise />} />
          <Route path="ManualFractionalise" element={<ManualFractionalise />} />
          <Route path="CreateFraction" element={<CreateFraction />} />

        </Routes>
      </div>
    </>
  )
}

export default App;
