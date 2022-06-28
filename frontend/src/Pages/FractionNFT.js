import React from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Alert} from 'react-bootstrap'
import { Link, useMatch, useResolvedPath } from "react-router-dom";

function FractionNFT() {
    return (
    <div>
        <Alert>Fraction NFT</Alert>

        <CustomLink to="/FractionaliseWallet">
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