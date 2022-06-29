import { React, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'

import { Button, Form } from 'react-bootstrap'
import { ethers } from "ethers";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { selectedNft } from "./ProposalWallet"
import Auction from "../../Json/Auction.json";

import { RinkebyAuctionAddress } from '../../App';

//const etherScanApi = `https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${selectedNft.asset_contract.address}&apikey=QF41CVNJWPQBFG2WKQPSCW345TYU5WMTKY`
function CreateProposal() {
    const [startingPrice, setStartingPrice] = useState();
    const [time, setTime] = useState();
    const [stakeAmount, setStakeAmount] = useState();
    const [stakedBalance, setStakedBalance] = useState();

    const handleStartingPriceChange = (event) => setStartingPrice(event.target.value)
    const handleTimeChange = (event) => setTime(event.target.value)
    const handleStakeAmountChange = (event) => setStakeAmount(event.target.value)
    
    async function getStakedBalance() {
        if(window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(
                RinkebyAuctionAddress,
                Auction.abi,
                signer
            )
            try {
                const response = await contract.getTotalStaked(selectedNft.asset_contract.address, signer.getAddress())
                setStakedBalance(response)
                console.log("response: " + response)
            } catch (err) {
                console.log("error: " + err)
            }
        }
    }

    async function startProposal() {
        if(window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(
                RinkebyAuctionAddress,
                Auction.abi,
                signer
            )
            try {
                const response = await contract.startProposal(selectedNft.asset_contract.address, 
                                                              selectedNft.token_id,
                                                              startingPrice,
                                                              time,
                                                              stakeAmount);
                console.log("response: " + response);
            } catch (err) {
                console.log("error: " + err)
            }
        }
    }
    return(
        <nav>
            <CustomLink to="/ProposalWallet">Back</CustomLink>
 
            <Form>
                <Form.Group>
                    <Form.Label>Your staked balance:</Form.Label>
                    <Form.Control
                        //value={stakedBalance}
                        />
                    <Button
                        onClick={getStakedBalance}>get balance</Button>

                    <Form.Label>Starting price:</Form.Label>
                    <Form.Control
                        placeholder="Enter starting price"
                        onChange={handleStartingPriceChange}/>

                    <Form.Label>Time:</Form.Label>
                    <Form.Control
                        placeholder="Enter time"
                        onChange={handleTimeChange}/>

                    <Form.Label>Stake Amount:</Form.Label>
                    <Form.Control
                        placeholder="Enter stake amount"
                        onChange={handleStakeAmountChange} />
                </Form.Group>

                <Button
                onClick={startProposal}>Create Proposal</Button>

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

export default CreateProposal;