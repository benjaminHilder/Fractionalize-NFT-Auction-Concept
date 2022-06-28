import { React, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import { Button} from 'react-bootstrap'
import { ethers } from "ethers";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

import { RinkebyStorageAddress } from '../../App';

export let selectedNft

//rinkeby
const StorageContractAddress = "0x74066c2Dc145CB8B07eADDDFFc740f43a52983F1"

function ProposalWallet() {
    const [data, setData] = useState([])
    const [depositedNfts, setDepositedNfts] = useState([])

    const getData = () => { 
        const options = {method: 'GET', headers: {Accept: 'application/json'}};
        
        fetch(`https://testnets-api.opensea.io/api/v1/assets?owner=${RinkebyStorageAddress}&order_direction=desc&limit=20&include_orders=false`, 
        options
        )
          .then(response => response.json())
          .then(response => setData(response.assets))
          .catch(err => console.error(err));
    }

    function setUserDepositedNfts() {
        if(window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(
                RinkebyStorageAddress,
                Storage.abi,
                signer
            );
            try {
                let deposits = [];
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < contract.getAddressDepositedNfts(signer.getAddress()).length; i++) {
                    if (data[i] == contract.getAddressDepositedNfts(signer.getAddress())[j]) {
                        deposits.push(data[i]);
                    }
                }
            }
            setDepositedNfts(deposits);
            } catch (err) {

            }
        } 
    }

    const renderNfts = (nft, index) => {
        return(<Button key={index}
        onClick={() => selectedNft = nft}>
            <CustomLink to="/CreateProposal">
                <img src={nft.image_url}></img>

            </CustomLink>
            <p>{nft.name}</p>
        </Button>)
    }

    return(
        <nav>
            <div>
            <CustomLink to="/WithdrawNFT">Back</CustomLink>
            <Button onClick={getData}>Get Nfts</Button>
            </div>
            
            {data.map(renderNfts)}
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

export default ProposalWallet;