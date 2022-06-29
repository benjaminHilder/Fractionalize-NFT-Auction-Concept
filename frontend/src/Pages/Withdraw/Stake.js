import { React, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import {Link, useMatch, useResolvedPath } from "react-router-dom";
import { Button, Form } from 'react-bootstrap'
import { ethers } from "ethers";

import selectedNftAddress from './StakeWallet';
import RinkebyAuctionAddress from '../../App.js';
import Auction from '../../Json/Auction.json'

function Stake() {
    const [stakeAmount, setStakeAmount] = useState()

    const handleStakeAmountChange = (event) => setStakeAmount(event.target.value)

    async function stakeTokens() {
        //console.log("nft: " + selectedNft)
        console.log("address: " + selectedNftAddress)
        //console.log("amount " + stakeAmount)
        if(window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(
                RinkebyAuctionAddress,
                Auction.abi,
                signer
            )
            try {

                const response = await contract.stakeTokens(selectedNftAddress, stakeAmount)
            console.log("staking " + stakeAmount + " to address " + selectedNftAddress)
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
                    <Form.Label>Stake Amount</Form.Label>
                    <Form.Control
                        placeholder="Enter how much you want to stake"
                        onChange={handleStakeAmountChange} />

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