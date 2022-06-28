import { React, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Form } from 'react-bootstrap'
import { ethers } from "ethers";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

import Storage from "../../Json/Storage.json";
import { RinkebyStorageAddress } from '../../App';

function Withdraw() {
    const [nftContractAddress, setNftContractAddress] = useState()
    const [nftId, setNftId] = useState()

    const handleNftContractAddressChange = (event) => setNftContractAddress(event.target.value)
    const handleNftIdChange = (event) => setNftId(event.target.value);

    async function withdrawNftFromStorage() {
        if(window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(
                RinkebyStorageAddress,
                Storage.abi,
                signer
            )
            try {
                const response = await contract.withdrawNft(nftContractAddress, nftId)
                console.log('response: ' + response);
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
                    <Form.Label>Enter NFT contract address:</Form.Label>
                    <Form.Control 
                        placeholder="Enter NFT contract address"
                        onChange={handleNftContractAddressChange}/>
                    <Form.Label>Enter NFT ID:</Form.Label>
                    <Form.Control 
                        placeholder="Enter NFT ID"
                        onChange={handleNftIdChange}/>
                </Form.Group>
            </Form>
            <Button
            onClick={withdrawNftFromStorage}>Withdraw</Button>
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

export default Withdraw;