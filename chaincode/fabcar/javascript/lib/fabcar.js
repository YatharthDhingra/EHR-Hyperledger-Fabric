/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */



'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    //1.INIT LEDGER
    //2.WRITE DATA
    //3.READ DATA

    //This should be present as when chaincode is deployed , it looks for this method to ensure the chaincode is properly installed
    //ctx -> context
    //A transaction context performs two functions. Firstly, it allows a developer to define and maintain user variables across transaction invocations within a smart contract. Secondly, it provides access to a wide range of Fabric APIs that allow smart contract developers to perform operations relating to detailed transaction processing. These range from querying or updating the ledger, both the immutable blockchain and the modifiable world state, to retrieving the transaction-submitting application’s digital identity.
    //ctx.stub is used to access APIs that provide a broad range of transaction processing operations from putState() and getState() to access the ledger, to getTxID() to retrieve the current transaction ID.
    async initLedger(ctx){
        await ctx.stub.putState("test" , "Hello World") //key value pair -> asset/data
        console.log('fabcar chaincode running')
        return "Success"
    }

    async writeData(ctx , key , value){
        let temp_obj = JSON.parse(value)
        console.log("Hi")
        await ctx.stub.putState(key , value) //writes a byte array(array of bytes) , data is stored in ledger in form of byte array
        return value
    }

    async readData(ctx , key){
        let response = await ctx.stub.getState(key)  //returns a byte array
        return response.toString()  //converting to a string
    }  

    // async initLedger(ctx) {
    //     console.info('============= START : Initialize Ledger ===========');
    //     const cars = [
    //         {
    //             color: 'blue',
    //             make: 'Toyota',
    //             model: 'Prius',
    //             owner: 'Tomoko',
    //         },
    //         {
    //             color: 'red',
    //             make: 'Ford',
    //             model: 'Mustang',
    //             owner: 'Brad',
    //         },
    //         {
    //             color: 'green',
    //             make: 'Hyundai',
    //             model: 'Tucson',
    //             owner: 'Jin Soo',
    //         },
    //         {
    //             color: 'yellow',
    //             make: 'Volkswagen',
    //             model: 'Passat',
    //             owner: 'Max',
    //         },
    //         {
    //             color: 'black',
    //             make: 'Tesla',
    //             model: 'S',
    //             owner: 'Adriana',
    //         },
    //         {
    //             color: 'purple',
    //             make: 'Peugeot',
    //             model: '205',
    //             owner: 'Michel',
    //         },
    //         {
    //             color: 'white',
    //             make: 'Chery',
    //             model: 'S22L',
    //             owner: 'Aarav',
    //         },
    //         {
    //             color: 'violet',
    //             make: 'Fiat',
    //             model: 'Punto',
    //             owner: 'Pari',
    //         },
    //         {
    //             color: 'indigo',
    //             make: 'Tata',
    //             model: 'Nano',
    //             owner: 'Valeria',
    //         },
    //         {
    //             color: 'brown',
    //             make: 'Holden',
    //             model: 'Barina',
    //             owner: 'Shotaro',
    //         },
    //     ];

    //     for (let i = 0; i < cars.length; i++) {
    //         cars[i].docType = 'car';
    //         await ctx.stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
    //         console.info('Added <--> ', cars[i]);
    //     }
    //     console.info('============= END : Initialize Ledger ===========');
    // }

    // async queryCar(ctx, carNumber) {
    //     const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
    //     if (!carAsBytes || carAsBytes.length === 0) {
    //         throw new Error(`${carNumber} does not exist`);
    //     }
    //     console.log(carAsBytes.toString());
    //     return carAsBytes.toString();
    // }

    // async createCar(ctx, carNumber, make, model, color, owner) {
    //     console.info('============= START : Create Car ===========');

    //     const car = {
    //         color,
    //         docType: 'car',
    //         make,
    //         model,
    //         owner,
    //     };

    //     await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
    //     console.info('============= END : Create Car ===========');
    // }

    // async queryAllCars(ctx) {
    //     const startKey = '';
    //     const endKey = '';
    //     const allResults = [];
    //     for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
    //         const strValue = Buffer.from(value).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             console.log(err);
    //             record = strValue;
    //         }
    //         allResults.push({ Key: key, Record: record });
    //     }
    //     console.info(allResults);
    //     return JSON.stringify(allResults);
    // }

    // async changeCarOwner(ctx, carNumber, newOwner) {
    //     console.info('============= START : changeCarOwner ===========');

    //     const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
    //     if (!carAsBytes || carAsBytes.length === 0) {
    //         throw new Error(`${carNumber} does not exist`);
    //     }
    //     const car = JSON.parse(carAsBytes.toString());
    //     car.owner = newOwner;

    //     await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
    //     console.info('============= END : changeCarOwner ===========');
    // }

}

module.exports = FabCar;
