import React from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'

import { Button, Card } from 'react-bootstrap'
import { ethers } from "ethers";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

function ActiveAuctions() {

    return(
        <nav>
            <CustomLink to="/WithdrawNFT">Back</CustomLink>
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

export default ActiveAuctions;