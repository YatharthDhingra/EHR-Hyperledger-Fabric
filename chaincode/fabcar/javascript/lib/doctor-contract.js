'use strict';

let Patient = require('./Patient.js');
//inherits from both admin and primary contract
const AdminContract = require('./admin-contract.js');
const PrimaryContract = require("./primary-contract.js");
const { Context } = require('fabric-contract-api');

//only those patients will be available to doctors who have granted access to them
class DoctorContract extends AdminContract{

    async readPatient(ctx , patientId){
        //Class.prototype.method: The Class.prototype.method is created which is related to the instance of the object. 
        //It is called using the object instance name. Each instance of the class will have its own cClass.prototype.method: The Class.prototype.method is created which is related to the instance of the object. It is called using the object instance name. Each instance of the class will have its own copy of this method.opy of this method.
        let asset = await PrimaryContract.prototype.readPatient(ctx , patientId)

        const doctorId = await this.getClientId(ctx) //this returns the doctorId of the doctor which initiated the transaction

        if(!asset.permissionGranted.includes(doctorId)){
            throw new Error(`The doctor ${doctorId} doesn't have the permission to patient ${patientId}`)
        }
        //these things must be visible to doctor
        asset = ({
            patientId: patientId,
            firstName: asset.firstName,
            lastName: asset.lastName,
            age: asset.age,
            bloodGroup: asset.bloodGroup,
            allergies: asset.allergies,
            symptoms: asset.symptoms,
            diagnosis: asset.diagnosis,
            treatment: asset.treatment,
            followUp: asset.followUp
        });
        return asset
    }

    //only the medical details can be changed by doctor
    async updatePatientMedicalDetails(ctx , args){
        //args must be string
        args = JSON.parse(args)

        let isDataChanged = false; //if doctor changes data , this will be set to true
        let patientId = args.patientId;
        let newSymptoms = args.symptoms;
        let newDiagnosis = args.diagnosis;
        let newTreatment = args.treatment;
        let newFollowUp = args.followUp;
        let updatedBy = args.changedBy;

        const patient = await PrimaryContract.prototype.readPatient(ctx, patientId);
        //error will be handled here if doctor has permission or not

        if (newSymptoms !== null && newSymptoms !== '' && patient.symptoms !== newSymptoms) {
            patient.symptoms = newSymptoms;
            isDataChanged = true;
        }

        if (newDiagnosis !== null && newDiagnosis !== '' && patient.diagnosis !== newDiagnosis) {
            patient.diagnosis = newDiagnosis;
            isDataChanged = true;
        }

        if (newTreatment !== null && newTreatment !== '' && patient.treatment !== newTreatment) {
            patient.treatment = newTreatment;
            isDataChanged = true;
        }

        if (newFollowUp !== null && newFollowUp !== '' && patient.followUp !== newFollowUp) {
            patient.followUp = newFollowUp;
            isDataChanged = true;
        }

        if (updatedBy !== null && updatedBy !== '') {
            patient.changedBy = updatedBy;
        }

        if (isDataChanged === false) return;

        await ctx.stub.putState(patientId, JSON.stringify(patient));
    }

    //Retrieves patient medical history based on patientId
    async getPatientHistory(ctx, patientId) {
        let resultsIterator = await ctx.stub.getHistoryForKey(patientId); //inbuilt function
        let asset = await this.getAllPatientResults(resultsIterator, true);  

        return this.fetchLimitedFields(asset, true);
    }

    //Retrieves all patients details that have granted access to this doctorId
    async queryAllPatients(ctx, doctorId) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'patient';
        let asset = await this.getQueryResultForQueryString(ctx , JSON.stringify(queryString)) //this queries all the patients

        //now we filter those which have granted access to this doctor
        const permissionedAssets = [];
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            if ('permissionGranted' in obj.value && obj.value.permissionGranted.includes(doctorId)) {
                permissionedAssets.push(asset[i]);
            }
        }

        return this.fetchLimitedFields(permissionedAssets);
    }

    fetchLimitedFields = (asset, includeTimeStamp = false) => {
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            asset[i] = {
                patientId: obj.key,
                firstName: obj.value.firstName,
                lastName: obj.value.lastName,
                age: obj.value.age,
                bloodGroup: obj.value.bloodGroup,
                allergies: obj.value.allergies,
                symptoms: obj.value.symptoms,
                diagnosis: obj.value.diagnosis,
                treatment: obj.value.treatment,
                followUp: obj.value.followUp
            };
            if (includeTimeStamp) {
                asset[i].changedBy = obj.value.changedBy;
                asset[i].Timestamp = obj.Timestamp;
            }
        }

        return asset;
    };

    //to get doctor id who has initiated this transaction
    async getClientId(ctx) {
        const clientIdentity = ctx.clientIdentity.getID();
    
        let identity = clientIdentity.split('::');
        identity = identity[1].split('/')[2].split('=');
        return identity[1].toString('utf8');
    }

}

module.exports = DoctorContract