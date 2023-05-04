'use strict';

let Patient = require('./Patient.js');
const crypto = require('crypto');
const PrimaryContract = require('./primary-contract.js');
const { Context } = require('fabric-contract-api');

class PatientContract extends PrimaryContract{
    
    //read patient details(from primary contract)
    async readPatient(ctx , patientId){
        return await super.readPatient(ctx , patientId)
    }

    //delete patient from the ledger based on patientId
    async deletePatient(ctx , patientId){
        const exists = await this.patientExists(ctx , patientId)
        if(!exists){
            throw new Error(`The patient with ID: ${patientId} does not exist`)
        }
        await ctx.stub.deleteState(patientId) 
    }

     //This function is to update patient personal details. This function should be called by patient.
     async updatePatientPersonalDetails(ctx, args) {
        //args should be a json string
        args = JSON.parse(args);
        let isDataChanged = false; //variable to tell if data is changed or not
        let patientId = args.patientId;
        let newFirstname = args.firstName;
        let newLastName = args.lastName;
        let newAge = args.age;
        let updatedBy = args.changedBy;
        let newPhoneNumber = args.phoneNumber;
        let newAddress = args.address;
        let newAllergies = args.allergies;

        const patient = await this.readPatient(ctx, patientId)
        if (newFirstname !== null && newFirstname !== '' && patient.firstName !== newFirstname) {
            patient.firstName = newFirstname;
            isDataChanged = true;
        }

        if (newLastName !== null && newLastName !== '' && patient.lastName !== newLastName) {
            patient.lastName = newLastName;
            isDataChanged = true;
        }

        if (newAge !== null && newAge !== '' && patient.age !== newAge) {
            patient.age = newAge;
            isDataChanged = true;
        }

        if (updatedBy !== null && updatedBy !== '') {
            patient.changedBy = updatedBy;
        }

        if (newPhoneNumber !== null && newPhoneNumber !== '' && patient.phoneNumber !== newPhoneNumber) {
            patient.phoneNumber = newPhoneNumber;
            isDataChanged = true;
        }

        if (newAddress !== null && newAddress !== '' && patient.address !== newAddress) {
            patient.address = newAddress;
            isDataChanged = true;
        }

        if (newAllergies !== null && newAllergies !== '' && patient.allergies !== newAllergies) {
            patient.allergies = newAllergies;
            isDataChanged = true;
        }

        if (isDataChanged === false) return;

        await ctx.stub.putState(patientId, JSON.stringify(patient));
    }

    //to update the password of the patient
    async updatePassword(ctx , args){
        //args should be JSON string
        args = JSON.parse(args)
        let patientId = args.patientId
        let newPassword = args.newPassword

        if(newPassword === null || newPassword === ''){
            throw new Error(`Empty or null values shouldn't be passed as password`)
        }

        const patient = await this.readPatient(ctx , patientId)
        patient.password = crypto.createHash('sha256').update(newPassword).digest('hex')
        //now we check if patient had a temp password provided by us before
        if(patient.pwdTemp){
            patient.pwdTemp = false //now its not temp
            patient.changedBy = patientId  //patient data last changed by
        }
        await ctx.stub.putState(patientId , JSON.stringify(patient))
    }

    //for patient to get his/her password
    async getPatientPassword(ctx , patientId){
        const patient = await this.readPatient(ctx , patientId)
        //returns both password details
        let temp = {
            password : patient.password,
            pwdTemp : patient.pwdTemp
        } 
        return temp
    }

    //gets patient medical history based on patientId
    async getPatientHistory(ctx , patientId){
        let resultsIterator = await ctx.stub.getHistoryForKey(patientId) //inbuilt function 
        let assetArr = await this.getAllPatientResults(resultsIterator , true)  //we passed getHistory = true(primary-contract function)
        return this.fetchLimitedFields(assetArr , true)
    }

    //fetches the fields from asset array
    fetchLimitedFields = (asset, includeTimeStamp = false) => {
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            asset[i] = {
                patientId: obj.key,
                firstName: obj.value.firstName,
                lastName: obj.value.lastName,
                age: obj.value.age,
                address: obj.value.address,
                phoneNumber: obj.value.phoneNumber,
                bloodGroup: obj.value.bloodGroup,
                allergies: obj.value.allergies,
                symptoms: obj.value.symptoms,
                diagnosis: obj.value.diagnosis,
                treatment: obj.value.treatment,
                followUp: obj.value.followUp,
                changedBy: obj.value.changedBy
            };
            if (includeTimeStamp) {
                asset[i].timestamp = obj.timestamp;
            }
        }

        return asset;
    }

    //to grant access of patient to doctor
    async grantAccessToDoctor(ctx , args){
        //args should be in json string
        args = JSON.parse(args)
        let patientId = args.patientId
        let doctorId = args.doctorId

        const patient = await this.readPatient(ctx , patientId)
        if(!patient.permissionGranted.includes(doctorId)){ //if this doctor doesn't have permission , then grant
            patient.permissionGranted.push(doctorId)
            patient.changedBy = patientId //last data change by patient
        }
        await ctx.stub.putState(patientId , JSON.stringify(patient))
    }

    //to revoke access from a doctor
    async revokeAccessFromDoctor(ctx , args){
        args = JSON.parse(args)
        let patientId = args.patientId
        let doctorId = args.doctorId
        const patient = await this.readPatient(ctx , patientId)
        //remove doctor if has permission
        if(patient.permissionGranted.includes(doctorId)){
            //filter through all doctors who doesn't have the same Id
            patient.permissionGranted = patient.permissionGranted.filter(doctor => doctor!==doctorId)
            patient.changedBy = patientId
        }
        await ctx.stub.putState(patientId , JSON.stringify(patient))
    }

}

module.exports = PatientContract