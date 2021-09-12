import HDWalletProvider from 'truffle-hdwallet-provider';
import Web3 from 'web3';
import compiledFactory from './build/CampaignFactory.json';
import config from "./config.json";

const provider = new HDWalletProvider(
    config.key,
    config.link
);

const web3 = new Web3(provider);
const initialString = 'Hello There';
const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    const result = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: '0x' + compiledFactory.evm.bytecode.object })
        .send({ gas: '10000000', gasPrice: '5000000000', from: accounts[0] });
    
    console.log('Contract deployed to: ', result.options.address);
};
deploy();
