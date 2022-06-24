import { React, useState } from "react"
import 'bootstrap/dist/css/bootstrap.min.css'
import '../MainStyles.css'

import { Button, Card } from 'react-bootstrap'
import { ethers } from "ethers";
import { Link, useMatch, useResolvedPath, useSearchParams } from "react-router-dom";
import { connectedAddress } from "../Navbar.js"

export let selectedNft

function Fractionalise() {
    const [data, setData] = useState([])


    const getData = () => {        
        const options = {method: 'GET', headers: {Accept: 'application/json'}};
        
        fetch(`https://api.opensea.io/api/v1/assets?owner=${connectedAddress}&order_direction=desc&limit=20&include_orders=false`, 
        options
        )
          .then(response => response.json())
          .then(response => setData(response.assets))
          .catch(err => console.error(err));
    }

        
    const renderButton = (nft, index) => {
        return(<Button key={index}
        onClick={() => selectedNft = nft}>
            <CustomLink to="/CreateFraction">
                <img src={nft.image_url}></img>

            </CustomLink>
            <p>{nft.name}</p>
        </Button>)
    }

    return(
        <nav>
            <div>
            <CustomLink to="/FractionNFT">Back</CustomLink>
            <Button onClick={getData}>Get NFTs</Button>
            </div>

        {data.map(renderButton)}
        </nav>
    )


    function CustomLink( { to, children, ...props }) {
        const resolvedPath = useResolvedPath(to)
        const isActive = useMatch({ path: resolvedPath.pathname, end: true })
        return (
            <li className={isActive ? "active" : ""}>
                <Link to={to} {...props}>{children}</Link>
            </li>
        )
    }
}

export default Fractionalise;