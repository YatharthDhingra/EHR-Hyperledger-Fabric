'use strict'; //code should be executed in strict mode

const { Contract } = require('fabric-contract-api');
let Patient = require('./Patient.js');
let initPatients = require('./initLedger.json');

class PrimaryContract extends Contract {

    //ctx -> context
    //A transaction context performs two functions. Firstly, it allows a developer to define and maintain user variables across transaction invocations within a smart contract. Secondly, it provides access to a wide range of Fabric APIs that allow smart contract developers to perform operations relating to detailed transaction processing. These range from querying or updating the ledger, both the immutable blockchain and the modifiable world state, to retrieving the transaction-submitting application’s digital identity.
    //ctx.stub is used to access APIs that provide a broad range of transaction processing operations from putState() and getState() to access the ledger, to getTxID() to retrieve the current transaction ID.

    //This should be present as when chaincode is deployed , it looks for this method to ensure the chaincode is properly installed
    //Also initializes the ledger
    async initLedger(ctx) {
        console.log('*****START: LEDGER INITIALIZATION*****')
        for (let i = 0; i < initPatients.length; i++) {

            initPatients[i].docType = 'patient';  //setting a document type property -> patient

            //key -> PID${i}
            //value -> JSON object(stringified)
            await ctx.stub.putState('PID' + i, JSON.stringify(initPatients[i]));
            console.log('Added ---> ', initPatients[i]);
        }
        console.info('*****END : LEDGER INITIALIZED*****')
    }

    //Read patient details based on PID
    async readPatient(ctx, patientId) {
        //checking if patient exists or not
        const exists = await this.patientExists(ctx, patientId);
        if (!exists) {
            throw new Error(`The patient ${patientId} does not exist`);
        }

        const response = await ctx.stub.getState(patientId); //this is returned as a byte-array
        return JSON.parse(response.toString()) //to convert it into json object
    }

    //Check if patient exists or not based on PID
    async patientExists(ctx, patientId) {
        const response = await ctx.stub.getState(patientId);
        return (response.length > 0);  
    }

    //we can search using an attribute i.e. queryString (using Mango in couchDB) , whose selector property must be set up
    async getQueryResultForQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString); //returns an iterator
        //iterator also returns historical data
        let results = await this.getAllPatientResults(resultsIterator); //get data from iterator
        return results;
    }

    //we fetch all patients matching our queryString using the iterator
    //isHistory -> if we want history of the patient too or not
    async getAllPatientResults(iterator, isHistory=false) {
        let resultArray = []
        while(true){
            let res = await iterator.next() //this will give individual value
            //res.value -> value + metadata
            //res.value.key -> key
            //res.value.value -> actual data
            if(res.value && res.value.value.toString()){
                let resJson = {}  //to fetch the json data
                resJson.key = res.value.key
                resJson.value = JSON.parse(res.value.value.toString('utf8'))
                if(isHistory){   //if we also want the history , we also give the timestamp
                    resJson.timestamp = res.value.timestamp
                }
                resultArray.push(resJson)
            }
            //to exit the while loop
            if(res.done){
                await iterator.close() //before exiting , we have to close the iterator
                return resultArray
            }
        }
    }
    
}
module.exports = PrimaryContract;