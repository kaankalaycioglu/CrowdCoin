import assert from 'assert';
import ganache from 'ganache-cli';
import Web3 from 'web3';
import compiledFactory from '../ethereum/build/CampaignFactory.json';
import compiledCampaign from '../ethereum/build/Campaign.json';

const web3 = new Web3(ganache.provider({ gasLimit: 10000000 }));

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0]);
    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: '0x' + compiledFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: '10000000'});

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'    
    });

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
    campaign = await new web3.eth.Contract(
        compiledCampaign.abi,
        campaignAddress
    );
});

describe('Campaigns', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('allows people to contribute money and marks them as approvers', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });
        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    });

    it('requires a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                value: '5',
                from: accounts[1]
            });
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('allows a manager to make a payment request', async () => {
        await campaign.methods.createRequest('buy batteries', '100', accounts[1]).send({
            from: accounts[0],
            gas: '10000000'
        });
        const request = await campaign.methods.requests(0).call();

        assert.equal('buy batteries', request.description);
    });

    it('processes request', async () => {
        await campaign.methods.contribute().send({
            value: web3.utils.toWei('10', 'ether'),
            from: accounts[0]
        });

        await campaign.methods.createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1]).send({
            from:accounts[0],
            gas: '10000000'
        });

        await campaign.methods.approveRequest(0).send({
            from:accounts[0],
            gas: '10000000'
        });

        await campaign.methods.finalizeRequest(0).send({
            from:accounts[0],
            gas: '10000000'
        });

        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        console.log(balance);
        assert(balance > 103);
    });
});