import './App.css';
import React from 'react';
import Navbar from './Navbar';
import FractionNFT from './Pages/FractionNFT';
import MintNFT from './Pages/MintNFT';
import Home from './Pages/Home';
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

        </Routes>
      </div>
    </>
  )
}

export default App;
