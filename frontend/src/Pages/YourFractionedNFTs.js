import { React, useState } from 'react';
import { selectedNft } from "./YourFractionedNFTsWallet";
import { Button, Form } from 'react-bootstrap'
import { ethers, BigNumber } from "ethers";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import axios from "axios";
import Storage from "../Json/Storage.json"

import { RinkebyStorageAddress } from '../App';

function YourFractionedNFTs() {
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
        setNftAbi(res.data.result)
    }

    async function getInfo() {
        console.log(selectedNft)
        console.log("contract address: " + selectedNft.asset_contract.address)
        console.log("token id: " + selectedNft.token_id)
    }
    
    return(
        <nav>
            <CustomLink to="/YourFractionedNFTsWallet">Back</CustomLink>

            <img src={selectedNft.image_url} />
            <p>{selectedNft.name} #{selectedNft.token_id}</p>

            <Form>
                <Form.Group>
                    <Form.Label>Token ID: </Form.Label>
                    <Form.Label>{selectedNft.asset_contract.address}</Form.Label>
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

export default YourFractionedNFTs;