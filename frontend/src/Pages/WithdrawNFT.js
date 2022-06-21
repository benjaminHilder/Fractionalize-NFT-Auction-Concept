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

const StorageContractAddress = "0xAE51a1487Ee7864D0200D9D22922C6741c7728f7"
const AuctionContractAddress = "0x80a59d42Ae2bB464721064895a58ca6857fF5CC4"
const NFTGeneratorContractAddress = "0x2444fa34EA2537f927fa9fB9586fbd4A46972785";

function WithdrawNFT() {
    const STATES = {
        MENU: 0,
        PROPOSALS: 1,
        ACTIVE_AUCTIONS: 2,
        CREATE_AUCTION: 3
    }

    const CurrentState = STATES.MENU



    return (
    <div>
        <Alert>Withdraw NFT</Alert>

        <CustomLink to="/Proposals">
        <Button>Proposals</Button>
        </CustomLink>

        <CustomLink to="/CreateAuction">
        <Button>Create Auction</Button>
        </CustomLink>

        <CustomLink to="/ActiveAuctions">
        <Button>Active Auctions</Button>
        </CustomLink>

    </div>

    
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

export default WithdrawNFT;