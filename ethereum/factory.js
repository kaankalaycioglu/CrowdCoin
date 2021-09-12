import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json'

const instance = new web3.eth.Contract(
    CampaignFactory.abi,
    '0x667b0328C390D78D0b2C7f1c5551ba48475c6293'
);

export default instance;