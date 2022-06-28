import React from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import mainStyle from '../MainStyles.css';
import { Button, Card } from 'react-bootstrap'
import { ethers } from "ethers";

import NFT from "../Json/NFT.json"
import { RinkebyNftAddress } from '../App';

async function handleAutoMintNext() {
    if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            RinkebyNftAddress,
            NFT.abi,
            signer
        );
        try {
            const response = await contract.mint(signer.getAddress(), 1);
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