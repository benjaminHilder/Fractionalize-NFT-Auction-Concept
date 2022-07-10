import { React, useEffect, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import {Link, useMatch, useResolvedPath } from "react-router-dom";
import { Button, Form } from 'react-bootstrap'
import { BigNumber, ethers } from "ethers";

import {selectedNft} from './StakeWallet';
import {RinkebyAuctionAddress, RinkebyStorageAddress}from '../../App.js';
import Auction from '../../Json/Auction.json'
import FractionToken from '../../Json/Auction.json'
import Storage from '../../Json/Storage.json'
import axios from "axios";

function Stake() {
    const [stakeAmount, setStakeAmount] = useState()
    const [tokenBalance, setTokenBalance] = useState();
    const [tokenAddress, setTokenAddress] = useState();
    const handleStakeAmountChange = (event) => setStakeAmount(event.target.value)

    const etherScanApi = `https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${tokenAddress}&apikey=QF41CVNJWPQBFG2WKQPSCW345TYU5WMTKY`
   //useEffect((
   //    updateTokenBalance()
   //), [])
   //async function updateTokenBalance() {
   //    if(window.ethereum) {
   //        const provider = new ethers.providers.Web3Provider(window.ethereum);
   //        const signer = provider.getSigner();

   //        const contract = new ethers.Contract(
   //            selectedNftAddress,
   //            FractionToken.abi,
   //            signer
   //        )
   //        try {
   //            const response = await contract.balanceOf(signer.getAddress())
   //            setTokenBalance(response)
   //            
   //        } catch (err) {
   //            console.log('error: ' + err)
   //        }
   //    }
   //}

   async function updateTokenAddress() {
        if(window.ethereum) {
             const provider = new ethers.providers.Web3Provider(window.ethereum);
             const signer = provider.getSigner();

            const contract = new ethers.Contract(
                RinkebyStorageAddress,
                Storage.abi,
                signer
            )
            try {
                const response = await contract.getFractionAddressFromNft(selectedNft.asset_contract.address, selectedNft.token_id);
                setTokenAddress(response);
            } catch (err) {
                console.log("error", err)
            }

            }
   }

    async function handleApproveAuctionContract() {
        console.log("token address: " + tokenAddress)
        if(window.ethereum) {
         const provider = new ethers.providers.Web3Provider(window.ethereum);
         const signer = provider.getSigner();

        const contract = new ethers.Contract(
            tokenAddress,
            FractionToken.abi,
            signer
        )
        try {
            //const supply = await contract.totalSupply();
            const response = await contract.approve(RinkebyAuctionAddress, stakeAmount);
            console.log('response: ' + response);
        } catch (err) {
            console.log("error", err)
        }

        }
    }

    async function stakeTokens() {
        if(window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(
                RinkebyAuctionAddress,
                Auction.abi,
                signer
            )
            try {
                console.log("address: " + selectedNft.asset_contract.address)
                const response = await contract.stakeTokens(selectedNft.asset_contract.address, stakeAmount)
                console.log("staking " + stakeAmount + " to address " + selectedNft.asset_contract.address)
            } catch (err) {
                console.log('error: ' + err)
            }
    }
    }
    return(
        <nav>
            <CustomLink to="/WithdrawNFT">Back</CustomLink>
            <Form>
                <Form.Group>
                    <Form.Label>Balance: </Form.Label>
                    <Form.Label>{tokenBalance}</Form.Label>
                    <Form.Label>Stake Amount</Form.Label>
                    <Form.Control
                        placeholder="Enter how much you want to stake"
                        onChange={handleStakeAmountChange} />

                    <Button
                        onClick={updateTokenAddress}>set token address</Button>
                    <Button 
                        onClick={handleApproveAuctionContract}>Approve Contract </Button>

                    <Button
                        onClick={stakeTokens}>Stake</Button>
                </Form.Group>
            </Form>
        </nav>
    )

    function CustomLink({ to, children, ...props }) {
        const resolvedPath = useResolvedPath(to)
        const isActive = useMatch({ path: resolvedPath.pathname, end: true })
        return (
            <li className={isActive ? "active" : ""}>
                <Link to={to} {...props}>{children}</Link>
            </li>
        )
    }

    }


export default Stake;