import React from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import mainStyle from '../MainStyles.css';
import { Button, Alert, Form} from 'react-bootstrap'
import { ethers, BigNumber } from 'ethers';

import baseFractionToken from "../Json/baseFractionToken.json";
import Storage from "../Json/Storage.json";
import Auction from "../Json/Auction.json";
import NFTGenerator from "../Json/NFTGenerator.json"
import { useState } from 'react';

import { Link, useMatch, useResolvedPath } from "react-router-dom";

//ropsten
//const StorageContractAddress = "0xAE51a1487Ee7864D0200D9D22922C6741c7728f7"
//const NFTGeneratorContractAddress = "0x2444fa34EA2537f927fa9fB9586fbd4A46972785";

//rinkeby
const StorageContractAddress = "0x340F1507C375E3fA3Ce256ae0f879cc1a346139F"
const NFTGeneratorContractAddress = "0x245624eF9844B60C16d4C8c119F26aAF97301bf7";

function ManualFractionalise() {
    const [nftContractAddress, setNftContractAddress] = useState("");
    const [nftId, setNftId] = useState("")
    const [fractionTokenName, setFractionTokenName] = useState("")
    const [fractionTokenTicker, setFractionTokenTicker] = useState("")
    const [tokenSupply, setTokenSupply] = useState("")
    const [tokenRoyalty, setTokenRoyalty] = useState("")

    const handleNftContractAddressChange = (event) => setNftContractAddress(event.target.value);
    const handleNftIdChange = (event) => setNftId(event.target.value);
    const handleFractionTokenNameChange = (event) => setFractionTokenName(event.target.value);
    const handleFractionTokenTickerChange = (event) => setFractionTokenTicker(event.target.value);
    const handleTokenSupplyChange = (event) => setTokenSupply(event.target.value);
    const handleTokenRoyaltyChange = (event) => setTokenRoyalty(event.target.value);

    async function handleApproveNftContract() {
        if(window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                NFTGeneratorContractAddress,
                NFTGenerator.abi,
                signer
            );
            try {
                const response = await contract.approve(StorageContractAddress, nftId);
                console.log('response: ', response);
            } catch (err) {
                console.log("error", err);
            }
        }
    }

    async function handleDepositNft() {
        if(window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                StorageContractAddress,
                Storage.abi,
                signer
            );
            try {
                const response = await contract.depositNft(nftContractAddress, nftId);

                console.log('response: ', response);
            } catch (err) {
                console.log("error", err);
            }
        }
    }
    
    async function handleFractionNft() {
        if(window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                StorageContractAddress,
                Storage.abi,
                signer
            );

            try {
                const response = await contract.createFraction(nftContractAddress,
                                                               BigNumber.from(nftId),
                                                               fractionTokenName.toString(),
                                                               fractionTokenTicker.toString(),
                                                               BigNumber.from(tokenSupply),
                                                               BigNumber.from(tokenRoyalty));
                console.log('response: ', response);
            } catch (err) {
            console.log("error", err);
            }
        }
    }

    return (
    <div>
        <Alert>Fraction NFT</Alert>
        <CustomLink to="/FractionNFT">Back</CustomLink>
        <Form>
            <Form.Group>
                <Form.Label>Contract Address:</Form.Label>
                <Form.Control 
                    placeholder="Enter Contract Address"
                    onChange={handleNftContractAddressChange}/>
                <Form.Label>NFT ID:</Form.Label>
                <Form.Control 
                    placeholder="Enter NFT ID"
                    onChange={handleNftIdChange}/>
                <Form.Label>Fraction Token Name:</Form.Label>
                <Form.Control 
                    placeholder="Enter Fraction Token Name"
                    onChange={handleFractionTokenNameChange}/>
                <Form.Label>Fraction Token Ticker:</Form.Label>
                <Form.Control 
                    placeholder="Enter Token Ticker"
                    onChange={handleFractionTokenTickerChange}/>
                <Form.Label>Token Supply:</Form.Label>
                <Form.Control 
                    placeholder="Enter Fraction Token supply"
                    onChange={handleTokenSupplyChange}/>
                <Form.Label>Token Royalty:</Form.Label>
                <Form.Control 
                    placeholder="Enter Fraction Token Royalty"
                    onChange={handleTokenRoyaltyChange}/>
            </Form.Group>

            <Button
            onClick={handleApproveNftContract}>Approve Contract</Button>
            
            <Button
            onClick={handleDepositNft}>Deposit NFT</Button>
            
            <Button
            onClick={handleFractionNft}>Fraction NFT</Button>
        </Form>
    </div>
    );

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

export default ManualFractionalise;