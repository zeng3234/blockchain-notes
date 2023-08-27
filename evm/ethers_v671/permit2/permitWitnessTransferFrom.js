const { ethers, Contract } = require('ethers');
const { VoidSigner } = require('ethers');
const { formatEther, parseEther, formatUnits, parseUnits } = require('ethers');

const { id, keccak256, concat, solidityPackedKeccak256, solidityPacked } = require('ethers');
const { AbiCoder, TypedDataEncoder, verifyTypedData, Typed } = require('ethers');

const constants = require('../constants/config');
const abi_erc20 = require('../abis/IERC20.json');
// const abi_permit2 = require('../abis/IPermit2.json');
const abi_permit2 = require('../abis/IPermit2_remove_array.json');//同方法名，不同参数类型，ethers支持不友好
const approve_max = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const expireTime = 1893427200;//2030
let nonce = 7;
let amount = parseEther('1');//.toString('10');
const witnessTypeString = 'bytes32 witness)TokenPermissions(address token,uint256 amount)'
const witness = '0x27d12c9beb6ff1ef788cf87c0cc239569197c69b61c553c02846a2e8c3861b0a'

let wallet = new ethers.Wallet(constants.walletPrikey);
let customHttpProvider = new ethers.JsonRpcProvider(constants.rpc);
//
let permit2Contract = new Contract(constants.address_permit2, abi_permit2);
let permit2Signer = permit2Contract.connect(wallet.connect(customHttpProvider))

async function approveTokenPermit2() {
    let token = new Contract(constants.address_token18, abi_erc20);
    let tokenSigner = token.connect(wallet.connect(customHttpProvider))
    let tx = await tokenSigner.approve(constants.address_permit2, approve_max)
    console.log('approve: ' + tx.hash)
    await tx.wait();
}

async function signStep() {
    const _TOKEN_PERMISSIONS_TYPEHASH = id("TokenPermissions(address token,uint256 amount)");
    const _PERMIT_TRANSFER_FROM_TYPEHASH = id("PermitTransferFrom(TokenPermissions permitted,address spender,uint256 nonce,uint256 deadline)TokenPermissions(address token,uint256 amount)");
    const _PERMIT_TRANSFER_FROM_WITNESS_TYPEHASH_STUB =
        "PermitWitnessTransferFrom(TokenPermissions permitted,address spender,uint256 nonce,uint256 deadline,";
    console.log('_TOKEN_PERMISSIONS_TYPEHASH: ' + _TOKEN_PERMISSIONS_TYPEHASH)
    console.log('_PERMIT_TRANSFER_FROM_TYPEHASH: ' + _PERMIT_TRANSFER_FROM_TYPEHASH)
    let DOMAIN_SEPARATOR = await permit2Signer.DOMAIN_SEPARATOR();
    // let DOMAIN_SEPARATOR = '0x27d12c9beb6ff1ef788cf87c0cc239569197c69b61c553c02846a2e8c3861b0a';
    console.log('DOMAIN_SEPARATOR: ' + DOMAIN_SEPARATOR);
    const witness_kc256 = solidityPackedKeccak256(['string', 'string'], [_PERMIT_TRANSFER_FROM_WITNESS_TYPEHASH_STUB, witnessTypeString]);
    const test_ptfw_data = solidityPacked(['string', 'string'], [_PERMIT_TRANSFER_FROM_WITNESS_TYPEHASH_STUB, witnessTypeString]);
    const test_ptfw_hash = keccak256(test_ptfw_data);
    console.log('test_ptfw_data: ' + test_ptfw_data);
    console.log('test_ptfw_hash: ' + test_ptfw_hash);
    console.log('test_ptfw_hash2: ' + id(test_ptfw_data));
    console.log(_PERMIT_TRANSFER_FROM_WITNESS_TYPEHASH_STUB+witnessTypeString)
    console.log('idresult: ' + id(_PERMIT_TRANSFER_FROM_WITNESS_TYPEHASH_STUB + witnessTypeString));

    const coder = AbiCoder.defaultAbiCoder();
    //permit2/PermitHash.sol/_hashTokenPermissions
    const encode_tokenPermissions = coder.encode(
        ["bytes32", "tuple(address, uint256)"],
        [_TOKEN_PERMISSIONS_TYPEHASH, [constants.address_token18, amount]])
    const hash_tokenPermissions = keccak256(encode_tokenPermissions)
    //
    ////permit2/PermitHash.sol/function hash(ISignatureTransfer.PermitTransferFrom
    let spender = constants.walletAddress;//msg.sender!!
    const encode_PermitTransferFrom = coder.encode(
        ["bytes32", "bytes32", "address", "uint256", "uint256", "bytes32"],
        [witness_kc256, hash_tokenPermissions, spender, nonce, expireTime, witness])
    const hash_PermitTransferFrom = keccak256(encode_PermitTransferFrom)
    const allData = concat(
        [
            "0x1901",
            DOMAIN_SEPARATOR,
            hash_PermitTransferFrom
        ]
    )

    const hash_data = keccak256(allData);
    let signResult = await wallet.signingKey.sign(hash_data);

    //print
    console.log('tpdata: ' + encode_tokenPermissions)
    console.log('tphash: ' + hash_tokenPermissions)
    console.log('ptfdata: ' + encode_PermitTransferFrom)
    console.log('ptfhash: ' + hash_PermitTransferFrom)
    console.log('all: ' + allData)
    console.log('hash: ' + hash_data)
    console.log('signResults: ' + signResult.serialized)

    console.log('----------------------------------------------------------------')
    if (true) return
    /*
        function permitWitnessTransferFrom(
            PermitTransferFrom memory permit,
            SignatureTransferDetails calldata transferDetails,
            address owner,
            bytes32 witness,
            string calldata witnessTypeString,
            bytes calldata signature
        ) external {
            _permitTransferFrom(
                permit, transferDetails, owner, permit.hashWithWitness(witness, witnessTypeString), signature
            );
        }
    */
    let tx = await permit2Signer.permitWitnessTransferFrom(
        {
            permitted: {
                token: Typed.address(constants.address_token18),
                amount: amount
            },
            nonce: nonce,
            deadline: expireTime
        },
        {
            to: Typed.address(constants.walletAddress),
            requestedAmount: amount
        },
        Typed.address(constants.walletAddress),
        witness,
        Typed.string(witnessTypeString),
        signResult.serialized,
    );
    console.log('permitWitnessTransferFrom: ' + tx.hash)
}
//
async function signWithTypedDataEncoder() {
    const typedData = {
        "domain": {
            "name": 'Permit2',
            "chainId": constants.chainId,
            "verifyingContract": constants.address_permit2,
        },

        // Defining the message signing data content.
        "data": {
            permitted: {
                token: constants.address_token18,
                amount: amount
            },
            spender: constants.walletAddress,
            nonce: nonce,
            deadline: expireTime,
            witness: witness
            // "permitted": {
            //     "token": constants.address_token18,
            //     "amount": amount
            // },
            // spender: constants.walletAddress,
            // "nonce": nonce,
            // "deadline": expireTime
        },
        // Refers to the keys of the *types* object below.
        "primaryType": 'PermitWitnessTransferFrom',
        "types": {
            // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
            // EIP712Domain: [
            //     { name: 'name', type: 'string' },
            //     { name: 'version', type: 'string' },
            //     { name: 'chainId', type: 'uint256' },
            //     { name: 'verifyingContract', type: 'address' },
            // ],
            "TokenPermissions": [
                { "name": "token", "type": "address" },
                { "name": "amount", "type": "uint256" },
            ],
            "PermitWitnessTransferFrom": [
                { "name": "permitted", "type": "TokenPermissions" },
                { "name": "spender", "type": "address" },
                { "name": "nonce", "type": "uint256" },
                { "name": "deadline", "type": "uint256" },
                { "name": "witness", "type": "bytes32" },
            ],
        },
    };
    //
    const signature = wallet.signingKey.sign(TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.data))

    const encoder = TypedDataEncoder.from(typedData.types);
    console.log("primaryType  " + encoder.primaryType)
    console.log(encoder.hashStruct(encoder.primaryType, typedData.data))
    console.log(encoder.encodeData(encoder.primaryType, typedData.data))
    console.log("all1: " + encoder.hash(typedData.data));
    console.log("all: " + TypedDataEncoder.encode(typedData.domain, typedData.types, typedData.data));
    console.log('domain: ' + TypedDataEncoder.hashDomain(typedData.domain));



    console.log(signature.serialized)
    // if (true) return;
    let tx = await permit2Signer.permitWitnessTransferFrom(
        {
            permitted: {
                token: Typed.address(constants.address_token18),
                amount: amount
            },
            nonce: nonce,
            deadline: expireTime
        },
        {
            to: Typed.address(constants.walletAddress),
            requestedAmount: amount
        },
        Typed.address(constants.walletAddress),
        witness,
        Typed.string(witnessTypeString),
        signature.serialized,
    );
    console.log('permitWitnessTransferFrom: ' + tx.hash)
}
//
async function test() {

    // await approveTokenPermit2();
    await signStep();
    await signWithTypedDataEncoder();
    process.exit(0);
}

test();


