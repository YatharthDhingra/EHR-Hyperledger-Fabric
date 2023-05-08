//This file interacts with the fabric network

/*
An application has to follow six basic steps to submit a transaction:
-Select an identity from a wallet
-Connect to a gateway
-Access the desired network
-Construct a transaction request for a smart contract
-Submit the transaction to the network
-Process the response
*/

const {Gateway, Wallets} = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const {buildCAClient, registerAndEnrollUser} = require('./CAUtil.js');
const {buildCCPOrg1 , buildCCPOrg2, buildWallet} = require('./AppUtil.js');


const channelName = 'mychannel';
const chaincodeName = 'patient';
const mspOrg1 = 'Org1MSP';
const mspOrg2 = 'Org2MSP';
const walletPath = path.join(process.cwd(), '../../fabcar/javascript/wallet/');


//Connects to the network using the username - userId, networkObj contains the paramters using which a connection to the fabric network is possible.
exports.connectToNetwork = async function(userId) {
  const gateway = new Gateway();
  const ccp = buildCCPOrg1();

  try {
    const walletPath = path.join(process.cwd(), '../../fabcar/javascript/wallet/');  //check this

    const wallet = await buildWallet(Wallets, walletPath);

    const userExists = await wallet.get(userId);
    if (!userExists) {
      console.log('An identity for the userId: ' + userId + ' does not exist in the wallet');
      console.log('Create the userId before retrying');
      const response = {};
      response.error = 'An identity for the user ' + userId + ' does not exist in the wallet. Register ' + userId + ' first';
      return response;
    }

    /**
    * setup the gateway instance
    * The user will now be able to create connections to the fabric network and be able to
    * ubmit transactions and query. All transactions submitted by this gateway will be
    * signed by this user using the credentials stored in the wallet.
    */
    // using asLocalhost as this gateway is using a fabric network deployed locally
    await gateway.connect(ccp, {wallet, identity: userId, discovery: {enabled: true, asLocalhost: true}});

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(chaincodeName);

    const networkObj = {
      contract: contract,
      network: network,
      gateway: gateway,
    };
    console.log('Succesfully connected to the network.');
    return networkObj;
  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
    const response = {};
    response.error = error;
    return response;
  }
}


//to invoke transactions
//the networkObj consists of contract, network, gateway
//networkObj-the object which is given when connectToNetwork is executed
//args should be given as array consisting of one json object
exports.invoke = async function(networkObj, isQuery, func, args= '') {
    try { 
      //isQuery tells if it is a query or invoke transaction    
      if (isQuery === true) {  
        const response = await networkObj.contract.evaluateTransaction(func, args);
        console.log(response);
        await networkObj.gateway.disconnect();
        return response;
      } else {
        if (args) {
          args = JSON.parse(args[0]);
          args = JSON.stringify(args);
        }
        const response = await networkObj.contract.submitTransaction(func, args);
        await networkObj.gateway.disconnect();
        return response;
      }
    } catch (error) {
      const response = {};
      response.error = error;
      console.error(`Failed to submit transaction: ${error}`);
      return response;
    }
}
