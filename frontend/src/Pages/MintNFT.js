import React from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import mainStyle from '../MainStyles.css';
import { Button, Card } from 'react-bootstrap'
import { ethers } from "ethers";

import NFTGenerator from "../Json/NFTGenerator.json"

const NFTGeneratorContractAddress = "0x2444fa34EA2537f927fa9fB9586fbd4A46972785";

async function handleAutoMintNext() {
    if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            NFTGeneratorContractAddress,
            NFTGenerator.abi,
            signer
        );
        try {
            const response = await contract.safeMintNextId();
        } catch (err) {
            console.log("error", err);
        }
    }
}

function mintPage() {
    return (
        <div className={mainStyle.MintNft}>

            <Button className={mainStyle.MintNft} 
                    onClick={handleAutoMintNext}>Mint Button</Button>
        </div>
    )
}

export default mintPage;