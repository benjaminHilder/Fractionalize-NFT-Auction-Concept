import { React, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Alert} from 'react-bootstrap'
import { ethers, BigNumber } from "ethers";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

import { RinkebyStorageAddress }  from "../App.js"
import Storage from "../Json/Storage.json"

export let selectedNft

function YourFractionedNFTsWallet() {
    const [data, setData] = useState([])
    const [userData, setUserData] = useState([])

    const getData = () => {        
        const options = {method: 'GET', headers: {Accept: 'application/json'}};
        
        fetch(`https://testnets-api.opensea.io/api/v1/assets?owner=${RinkebyStorageAddress}&order_direction=desc&limit=20&include_orders=false`, 
        options
        )
          .then(response => response.json())
          .then(response => setData(response.assets))
          .catch(err => console.error(err));

         // console.log(data)
    }

    async function setUserDepositedNfts() {

        getData();
        if(window.ethereum) {
             const provider = new ethers.providers.Web3Provider(window.ethereum);
             const signer = provider.getSigner();
    
            const contract = new ethers.Contract(
                RinkebyStorageAddress,
                Storage.abi,
                signer
            )
            try {
                let userDepositedNftAddress = await contract.getUserDepositedNftAddress(signer.getAddress());
                let userDepositedNftIds = await contract.getUserDepositedNftIds(signer.getAddress());
                let userNFTs = [];
                for (let i = 0; i < data.length; i++) {
                    for (let j = 0; j < userDepositedNftAddress.length; j++) {
                        if (BigNumber.from(data[i].asset_contract.address).eq(BigNumber.from(userDepositedNftAddress[j])) &&
                            BigNumber.from(data[i].token_id).eq(userDepositedNftIds[j])) {
                                userNFTs.push(data[i])
                                console.log(data[i].name)
                                break;
                            }
                    }
                }

                setUserData(userNFTs);
                //console.log('response: ' + response);
            } catch (err) {
                console.log("error", err)
            }
    
            }

        
    }

    async function setNft(nft) {
        console.log("log: " + nft.asset_contract.address)
    }
   
    const renderNfts = (nft, index) => {
        return(<Button key={index}
        onClick={() => selectedNft = nft}>
            <CustomLink to="/YourFractionedNFTs">
                <img src={nft.image_url}></img>
                    
            </CustomLink>
            <p>{nft. name} #{nft.token_id}</p>
        </Button>)
    }

    return(
        <nav>
            <div>
            <CustomLink to="/FractionNFT">Back</CustomLink>
            <Button onClick={setUserDepositedNfts}>Get Nfts</Button>
            </div>

            {userData.map(renderNfts)}
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

export default YourFractionedNFTsWallet;