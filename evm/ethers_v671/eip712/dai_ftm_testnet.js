
const { ethers, Contract, TypedDataEncoder } = require('ethers');
const { VoidSigner } = require('ethers');
const { formatEther, parseEther, formatUnits, parseUnits } = require('ethers');
const constants = require('../constants/config');
const abi_erc20 = require('../abis/IERC20.json');

const address_dai = "0x418F853A3a5cBcbD73043a4B3b65AC32F088Ee45";
const address_tool = "0x01A03DD75bC8E7aD256F973e3C8aFf5E02F95b10";

const abi_dai = [{ "constant": false, "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "bool", "name": "allowed", "type": "bool" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }];
const abi_tool = [{ "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expireTime", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "deposit2", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];

let wallet = new ethers.Wallet(constants.walletPrikey);
let customHttpProvider = new ethers.JsonRpcProvider(constants.rpc);
let daiContract = new Contract(address_dai, abi_dai, customHttpProvider)


let toolContract = new Contract(address_tool, abi_tool, customHttpProvider)
let toolSigner = toolContract.connect(wallet.connect(customHttpProvider))

const expireTime = 1893427200;//2030
//dai 

let nonce = 0;
const typedData = {
    "domain": {
        "name": 'Dai Stablecoin',
        "version": '1',
        "chainId": constants.chainId,
        "verifyingContract": address_dai,
    },

    // Defining the message signing data content.
    "data": {
        "holder": constants.walletAddress,
        "spender": address_tool,
        "nonce": nonce,
        "expiry": expireTime,
        "allowed": true,
    },
    // Refers to the keys of the *types* object below.
    "primaryType": 'Permit',
    "types": {
        // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
        // EIP712Domain: [
        //     { name: 'name', type: 'string' },
        //     { name: 'version', type: 'string' },
        //     { name: 'chainId', type: 'uint256' },
        //     { name: 'verifyingContract', type: 'address' },
        // ],
        "Permit": [
            { "name": "holder", "type": "address" },
            { "name": "spender", "type": "address" },
            { "name": "nonce", "type": "uint256" },
            { "name": "expiry", "type": "uint256" },
            { "name": "allowed", "type": "bool" }
        ],
    },
};

async function test() {
    nonce = await daiContract.nonces(constants.walletAddress);
    console.log('nonce', nonce);
    typedData.data.nonce = nonce;
    console.log(typedData)
    const signature = wallet.signingKey.sign(TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.data))

    console.log(signature.serialized)
    console.log(signature.v)
    console.log(signature.r)
    console.log(signature.s)

    let tx = await toolSigner.deposit(parseEther('1'), nonce, expireTime, signature.v, signature.r, signature.s);
    console.log('hash: ' + tx.hash)
    await tx.wait();

    tx = await toolSigner.deposit2(parseEther('1'));
    console.log('hash: ' + tx.hash)
    process.exit(0);
}

test();