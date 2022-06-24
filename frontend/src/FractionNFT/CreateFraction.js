import { React, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'

import { Button, Card, Form } from 'react-bootstrap'
import { ethers, BigNumber } from "ethers";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

import Storage from "../Json/Storage.json";
import NFTGenerator from "../Json/NFTGenerator.json"



import { selectedNft } from "./Fractionalise";

const StorageContractAddress = "0xAE51a1487Ee7864D0200D9D22922C6741c7728f7"
const NFTGeneratorContractAddress = "0x2444fa34EA2537f927fa9fB9586fbd4A46972785";

function CreateFraction() {
    const [fractionTokenName, setFractionTokenName] = useState("")
    const [fractionTokenTicker, setFractionTokenTicker] = useState("")
    const [tokenSupply, setTokenSupply] = useState("")
    const [tokenRoyalty, setTokenRoyalty] = useState("")

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
                const response = await contract.approve(StorageContractAddress, selectedNft.token_id);
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
                const response = await contract.depositNft(selectedNft.asset_contract_address, selectedNft.token_id);

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
                const response = await contract.createFraction(selectedNft.asset_contract_address,
                                                               BigNumber.from(selectedNft.token_id),
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
    
    return(
        <nav>
            <CustomLink to="/Fractionalise">Back</CustomLink>

            <img src={selectedNft.image_url} />
            <p>{selectedNft.name}</p>
            <Form>
                <Form.Group>
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

export default CreateFraction;