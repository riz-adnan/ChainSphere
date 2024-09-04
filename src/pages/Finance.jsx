import React, { useState } from 'react';
// import axios from 'axios';

// Importing IPFS for storage and related things
// import { ethers } from 'ethers';
// import Web3Modal from 'web3modal';
import { create as ipfsHttpClient } from 'ipfs-http-client';
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function Finance() {
    const [hash, setHash] = useState('');

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        console.log(client);
        const add = await client.add(file);
        const url = `https://infura.ipfs.io/ipfs/${add.path}`;
        setHash(url);
    }

    return (
        <main className='dark:text-white mt-20'>
            <h1>Finance</h1>
            <input
                type="file"
                accept=".png"
                requierd
                onChange={handleFileChange}
            />
            {hash && <p>{hash}</p>}
        </main>
    )
}