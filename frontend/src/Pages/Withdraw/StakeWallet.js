import { React, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import { Button} from 'react-bootstrap'
import { ethers, BigNumber } from "ethers";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

import { RinkebyStorageAddress } from '../../App';
import Storage from '../../Json/Storage.json'

export let selectedNft
export let selectedNftAddress;

function StakeWallet() {
    const [data, setData] = useState([])
    const [userNfts, setUserNfts] = useState([]);
    
    const getData = () => { 
        const options = {method: 'GET', headers: {Accept: 'application/json'}};
        
        fetch(`https://testnets-api.opensea.io/api/v1/assets?owner=${RinkebyStorageAddress}&order_direction=desc&limit=20&include_orders=false`, 
        options
        )
          .then(response => response.json())
          .then(response => setData(response.assets))
          .catch(err => console.error(err));

        setUserDepositedNfts()
    }

    async function setUserDepositedNfts() {
        if(window.ethereum) {

            let acceptedNfts = [];

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                RinkebyStorageAddress,
                Storage.abi,
                signer
            );
            try {

                let addressDeposits = await contract.getUserDepositedNftAddress(signer.getAddress());
                let idDeposits = await contract.getUserDepositedNftIds(signer.getAddress());

            //if a user deposited nft is in the storage contract
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < addressDeposits.length; j++ ) {
                    if (BigNumber.from(data[i].asset_contract.address).eq(BigNumber.from(addressDeposits[j])) &&
                        data[i].token_id == idDeposits[j]) {
                        //console.log(data[i])
                        acceptedNfts.push(data[i])
                    }
                }
            }
            //console.log(acceptedNfts)
            setUserNfts(acceptedNfts);
            console.log(userNfts);
            console.log("1: " + userNfts[0])

            } catch (err) {
                console.log("error: " + err)
            }
        } 
    }

    async function setNft(nft) {
        //selectedNftAddress = nft.asset_contract.address
        console.log("log: " + nft.asset_contract.address)
    }

    const renderNfts = (nft, index) => {
        return(<Button key={index}
        onClick={setNft(nft)}>
            <CustomLink to="/Stake">
                <img src={nft.image_url}></img>

            </CustomLink>
            <p>{nft.name} #{nft.token_id}</p>
        </Button>)
    }

    return(
        <nav>
            <div>
            <CustomLink to="/WithdrawNFT">Back</CustomLink>
            <Button onClick={getData}>Get Nfts</Button>
            </div>
            
            {userNfts.map(renderNfts)}
            {/*userNfts.map(nft => console.log(nft))*/}
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

export default StakeWallet;