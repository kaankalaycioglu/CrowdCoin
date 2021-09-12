import web3 from './web3';
import Campaign from './build/Campaign.json'

const a = (address) => {
    return new web3.eth.Contract(
        Campaign.abi,
        address
    );
};
export default a;