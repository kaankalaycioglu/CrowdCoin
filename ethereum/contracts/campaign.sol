// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract CampaignFactory {
    
    Campaign[] public deployedCampaigns;
    
    function createCampaign(uint min) public {
        Campaign newCampaign = new Campaign(min, msg.sender);
        
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns(Campaign[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    
    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint numRequests;
    mapping (uint => Request) public requests;
    uint public approversCount;
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    constructor(uint min, address creator) {
        manager = creator;
        minimumContribution = min;
    }
    
    function contribute() public payable {
        require(msg.value > minimumContribution);
        
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function createRequest(string memory description, uint value, address payable recipient) public restricted {            
            Request storage r = requests[numRequests++];
            r.description = description;
            r.value = value;
            r.recipient = recipient;
            r.complete = false;
            r.approvalCount = 0;
        }
    
    function approveRequest(uint index) public {
        
        Request storage request = requests[index];
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
    function finalizeRequest(uint index) public restricted {
        require(!requests[index].complete);
        require(requests[index].approvalCount > (approversCount / 2));
        
        requests[index].recipient.transfer(requests[index].value);
        requests[index].complete = true;
    }

    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return (
            minimumContribution,
            address(this).balance,
            numRequests,
            approversCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return numRequests;
    }
}