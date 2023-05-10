/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const {buildCAClient , registerAndEnrollUser} = require('../../test-application/javascript/CAUtil.js')
const walletPath = '/home/yatharth/ehr/fabcar/javascript/wallet/'
const {buildCCPOrg1 , buildCCPOrg2 , buildWallet} = require('../../test-application/javascript/AppUtil.js')
let mspOrg;
let adminUserId;
let caClient;

//orgId -> 1 for Org1 , 2 for Org2
exports.enrollRegisterUser = async function(orgId, userId, attributes) {
    try {
      // setup the wallet to hold the credentials of the application user
      const wallet = await buildWallet(Wallets, walletPath);
      orgId = parseInt(orgId);
  
      if (orgId === 1) {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg1();
  
        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
  
        mspOrg = 'Org1MSP';
        adminUserId = 'org1admin';
      } else if (orgId === 2) {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg2();
  
        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
  
        mspOrg = 'Org2MSP';
        adminUserId = 'org2admin';
      }
      // enrolls users to Hospital 1 and adds the user to the wallet
      await registerAndEnrollUser(caClient, wallet, mspOrg, userId, adminUserId, attributes);
      console.log('msg: Successfully enrolled user ' + userId + ' and imported it into the wallet');
    } catch (error) {
      console.error(`Failed to register user "${userId}": ${error}`);
      process.exit(1);
    }
  }