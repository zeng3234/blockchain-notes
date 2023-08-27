const { DutchOrder, NonceManager, DutchOrderBuilder } = require('@uniswap/uniswapx-sdk');
const { ethers, BigNumber } = require('ethers');
const constants = require('../../constants/config');

const provider = new ethers.providers.JsonRpcProvider(constants.rpc);

const wallet = new ethers.Wallet(constants.walletPrikey);

// let provider = new ethers.JsonRpcProvider(RPC_URL);
// const account = await provider.getSigner().getAddress();
const nonceMgr = new NonceManager(provider, constants.chainId, constants.address_permit2);
// const nonce = await nonceMgr.useNonce(account);

const deadline = constants.deadline;


async function buildOrder() {
    //TODO permit2 nonce
    const nonce = 8;


    const builder = new DutchOrderBuilder(constants.chainId, constants.address_exclusive_dutch_order_reactor, constants.address_permit2);
    const order = builder
        .deadline(deadline)
        .decayEndTime(deadline)
        .decayStartTime(deadline - 100)
        .nonce(nonce)
        .swapper(constants.walletAddress)
        // .exclusiveFiller(signAddress,"0x64")
        .input({
            token: constants.address_token18,
            startAmount: BigNumber.from('10'),
            endAmount: BigNumber.from('10'),
        })
        .output({
            token: constants.address_token18_2,
            startAmount: BigNumber.from('10'),
            endAmount: BigNumber.from('10'),
            recipient: constants.walletAddress,
        })
        .build();

    // Sign the built order 
    const { domain, types, values } = order.permitData();
    const signature = await wallet._signTypedData(domain, types, values);

    const serializedOrder = order.serialize();
    // submit serializedOrder and signature to order pool
    console.log('serializedOrder: ' + serializedOrder);

    console.log('json ', order.toJSON())

    console.log(signature)

}


const { parseOrder, Order, OrderValidation } = require('@uniswap/uniswapx-sdk');
async function parse_order_data() {
    const serializedOrder = '-';
    // const order = parseOrder(serializedOrder);
    const order = DutchOrder.parse(serializedOrder,constants.chainId,constants.address_permit2);
    // const order = DutchOrder.parse(serializedOrder, 1, addr_permit2);

    console.log(order);
    console.log('---')
    const orderData = order.info;
    const orderHash = order.hash();
    console.log(orderData);
    console.log('---')
    console.log(orderHash);

    console.log(order.info.outputs[0].startAmount)
}

async function test() {
    await buildOrder();
    // await parse_order_data();
    process.exit(0);
}
test();