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


function FractionNFT() {
    return (
    <div>
        <Alert>Fraction NFT</Alert>

        <CustomLink to="/Fractionalise">
        <Button>Fractionalise NFT</Button>
        </CustomLink>

        <CustomLink to="/ManualFractionalise">
        <Button>Manual Fractionalise NFT</Button>
        </CustomLink>

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



export default FractionNFT;