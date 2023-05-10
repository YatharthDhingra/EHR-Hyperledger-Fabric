const network = require('../../../../test-application/javascript/app.js')
const Collection = require('../../db_models/model.js')
const {capitalize} = require('../capitalize.js')


//This method retrives an existing patient from the ledger
const getPatientById = async(req , res) => {
    const {username , role} = req.user  //who is currently login right now

    const patientId = req.params.patientId; 
    const networkObj = await network.connectToNetwork(username)
    const response = await network.invoke(networkObj , true , capitalize(role) + 'Contract:readPatient' , patientId)
    if(response.error){
        return res.status(400).send(response.error)
    }
    
    res.status(200).json(JSON.parse(response)) //send json object of patient data
}

//This method updates an existing patient personal details. This method can be executed only by the patient.
const updatePatientPersonalDetails = async(req , res) => {
    const {username , role} = req.user
    
    let args = req.body
    args.patientId = req.params.patientId
    args.changedBy = req.params.patientId
    args = [JSON.stringify(args)]

    const networkObj = await network.connectToNetwork(username)
    const response = await network.invoke(networkObj , false , capitalize(role) + 'Contract:updatePatientPersonalDetails' , args)
    if(response.error){
        return res.status(500).send(response.error)
    }
    res.status(200).send('success')
}

//Retrives the history transaction of an asset(Patient) in the ledger
const getPatientHistoryById = async(req , res) => {
    const {username , role} = req.user

    const patientId = req.params.patientId

    const networkObj = await network.connectToNetwork(username)
    const response = await network.invoke(networkObj , true , capitalize(role) + 'Contract:getPatientHistory' , patientId)
    const parsedResponse = await JSON.parse(response);
    if(response.error){
        return res.status(400).send(response.error)
    }
    res.status(200).json(parsedResponse)
}

//getting all doctors from mongoDB
const getAllDoctors = async(req , res) => {
    const doctorArr = await Collection.find({role : 'doctor'})
    const filteredArr = []
    //filtering username , firstname and lastname of doctor
    for(let i=0;i<doctorArr.length;i++){
        const docUsername = doctorArr[i].username , firstName = doctorArr[i].firstName , lastName = doctorArr[i].lastName;
        filteredArr.push({username : docUsername , firstName : firstName , lastName : lastName})
    }
    res.status(200).send(filteredArr)
}

//patients grant access to doctor
const grantAccessToDoctor = async(req , res) => {
    const {username , role} = req.user


    const patientId = req.params.patientId
    const doctorId = req.params.doctorId

    let args = {patientId: patientId, doctorId: doctorId};
    args= [JSON.stringify(args)];

    const networkObj = await network.connectToNetwork(username);

    const response = await network.invoke(networkObj, false, capitalize(role) + 'Contract:grantAccessToDoctor', args);
    if(response.error){
        return res.status(500).send(response.error)
    }
    res.status(200).send('success')
}   

//patients revoke access from doctor
const revokeAccessFromDoctor = async(req , res) => {
    const {username , role} = req.user

    const patientId = req.params.patientId
    const doctorId = req.params.doctorId

    let args = {patientId: patientId, doctorId: doctorId};
    args= [JSON.stringify(args)];

    const networkObj = await network.connectToNetwork(username);

    const response = await network.invoke(networkObj, false, capitalize(role) + 'Contract:revokeAccessFromDoctor', args);
    if(response.error){
        return res.status(500).send(response.error)
    }
    res.status(200).send('success')
}   

module.exports = {getPatientById,updatePatientPersonalDetails,getPatientHistoryById,getAllDoctors,grantAccessToDoctor,revokeAccessFromDoctor}