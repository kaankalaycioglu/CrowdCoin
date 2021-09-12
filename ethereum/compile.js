import path from 'path';
import fs from 'fs-extra'; 
import solc from 'solc';

const __dirname = fs.realpathSync('.');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf-8');

var input = {
    language: 'Solidity',
    sources: {
        'Campaign.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

fs.ensureDirSync(buildPath);

for (let contract in output.contracts['Campaign.sol']) {
    fs.outputJSONSync(
        path.resolve(buildPath, contract + '.json'), output.contracts['Campaign.sol'][contract]
    );
}
