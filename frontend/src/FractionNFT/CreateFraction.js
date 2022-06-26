import { React, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import { selectedNft } from "./FractionaliseWallet";
import { Button, Card, Form } from 'react-bootstrap'
import { ethers, BigNumber } from "ethers";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

import axios from "axios";
import Storage from "../Json/Storage.json";
import NFTGenerator from "../Json/NFTGenerator.json"


//ropsten
//const StorageContractAddress = "0xAE51a1487Ee7864D0200D9D22922C6741c7728f7"

//rinkeby
const StorageContractAddress = "0x74066c2Dc145CB8B07eADDDFFc740f43a52983F1"

function CreateFraction() {
    const [fractionTokenName, setFractionTokenName] = useState("")
    const [fractionTokenTicker, setFractionTokenTicker] = useState("")
    const [tokenSupply, setTokenSupply] = useState("")
    const [tokenRoyalty, setTokenRoyalty] = useState("")

    const [nftAbi, setNftAbi] = useState("");

    const handleFractionTokenNameChange = (event) => setFractionTokenName(event.target.value);
    const handleFractionTokenTickerChange = (event) => setFractionTokenTicker(event.target.value);
    const handleTokenSupplyChange = (event) => setTokenSupply(event.target.value);
    const handleTokenRoyaltyChange = (event) => setTokenRoyalty(event.target.value);

    const etherScanApi = `https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${selectedNft.asset_contract.address}&apikey=QF41CVNJWPQBFG2WKQPSCW345TYU5WMTKY`

    const getAbi = async () => {
        let res = await axios.get(etherScanApi)
        setNftAbi(JSON.parse(res.data.result))
    }

    async function getInfo() {
        console.log("contract address: " + JSON.stringify(selectedNft.asset_contract.address))
        console.log("token id: " + JSON.stringify(selectedNft.token_id))
    }
    
    async function handleApproveNftContract() {
        if(window.ethereum) {
        getAbi()
         const provider = new ethers.providers.Web3Provider(window.ethereum);
         const signer = provider.getSigner();

        const contract = new ethers.Contract(
            selectedNft.asset_contract.address,
            nftAbi,
            signer
        )
        try {
            const response = await contract.approve(StorageContractAddress, selectedNft.token_id);
            console.log('response: ' + response);
        } catch (err) {
            console.log("error", err)
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
                const response = await contract.depositNft(selectedNft.asset_contract.address, selectedNft.token_id);
                console.log('response: ', response);
            } catch (err) {
                console.log("error: ", err);
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
                let supplyString = BigNumber.from(tokenSupply).toString() + "000000000000000000";
                const response = await contract.createFraction(selectedNft.asset_contract.address,
                                                               BigNumber.from(selectedNft.token_id),
                                                               fractionTokenName.toString(),
                                                               fractionTokenTicker.toString(),
                                                               /*BigInt(supplyString*/ BigNumber.from(tokenSupply),
                                                               BigNumber.from(tokenRoyalty));
                console.log('response: ', response);
            } catch (err) {
            console.log("error", err);
            }
        }
    }
    
    return(
        <nav>
            <CustomLink to="/FractionaliseWallet">Back</CustomLink>

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

                <Button onClick={getInfo}>
                get info
                </Button>

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