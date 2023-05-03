let Patient = require('./Patient.js');
const PrimaryContract = require('./primary-contract.js');


//extended from Primary Contract
class AdminContract extends PrimaryContract {

    //Returns the last patientId in the set
    async getLatestPatientId(ctx) {
        let allResults = await this.queryAllPatients(ctx);

        return allResults[allResults.length - 1].patientId;
    }

    //Create patient in the ledger
    async createPatient(ctx, args) {
        args = JSON.parse(args); //args is a json object

        if (args.password === null || args.password === '') {
            throw new Error(`Empty or null values should not be passed for password parameter`);
        }

        //creating new Patient using patient class
        let newPatient = await new Patient(args.patientId, args.firstName, args.lastName, args.password, args.age,
            args.phoneNumber, args.emergPhoneNumber, args.address, args.bloodGroup, args.changedBy, args.allergies);
        const exists = await this.patientExists(ctx, newPatient.patientId); 
        //checking if patient exists already or not
        if (exists) {
            throw new Error(`The patient ${newPatient.patientId} already exists`);
        }
        //write on the ledger
        await ctx.stub.putState(newPatient.patientId, JSON.stringify(newPatient));
    }

    //Read patient details based on patientId
    async readPatient(ctx, patientId) {
        let asset = await super.readPatient(ctx, patientId) //using primary-contract method
        return asset;
    }

    //Delete patient from the ledger based on patientId
    async deletePatient(ctx, patientId) {
        const exists = await this.patientExists(ctx, patientId);
        //check if it exists
        if (!exists) {
            throw new Error(`The patient ${patientId} does not exist`);
        }
        await ctx.stub.deleteState(patientId); //delete it from the ledger
    }

    //Read patients based on lastname
    async queryPatientsByLastName(ctx, lastName) {
        let queryString = {};
        queryString.selector = {};
        //setting up the queryString selector property used in Mango CouchDB for filtering
        queryString.selector.docType = 'patient';
        queryString.selector.lastName = lastName;
        const response = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString)); //using the method from primary-contract
        let asset = JSON.parse(response.toString());

        return this.fetchLimitedFields(asset); //admin can see limited fields of a patient only
    }

    //Read patients based on firstName
    async queryPatientsByFirstName(ctx, firstName) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'patient';
        queryString.selector.firstName = firstName;
        const response = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        let asset = JSON.parse(response.toString());

        return this.fetchLimitedFields(asset);
    }

    //Retrieves all patients details
    async queryAllPatients(ctx) {
        // let resultsIterator = await ctx.stub.getStateByRange('', '');
        // let asset = await this.getAllPatientResults(resultsIterator);
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'patient';
        let asset = await this.getQueryResultForQueryString(ctx , JSON.stringify(queryString))

        return this.fetchLimitedFields(asset);
    }

    fetchLimitedFields = (asset) => {
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            asset[i] = {
                patientId: obj.Key,
                firstName: obj.Record.firstName,
                lastName: obj.Record.lastName,
                phoneNumber: obj.Record.phoneNumber,
            };
        }

        return asset;
    }
}
module.exports = AdminContract;