const network = require('../../../../test-application/javascript/app.js')
const {enrollRegisterUser} = require('../../registerUser.js')
const Collection = require('../../db_models/model.js')

//req.user has {username , role}
//Creates a patient as an user adds the patient to the wallet and an asset(patient) is added to the ledger
//res 201 response if asset is created else 400 with a simple json message
//req.body will have patient data
const createPatient = async(req , res) => {
    // const {username , role} = req.user //admin username and role
    let username = 'org1admin'
    const networkObj = await network.connectToNetwork(username) //connect to the network as org1admin or org2admin
    
    //we need to provide PID(last id  + 1) as username to this patient
    const lastId = await network.invoke(networkObj , true , 'AdminContract:getLatestPatientId')
    req.body.patientId = 'PID' + (parseInt(lastId.toString().slice(3)) + 1);

    req.body.password = Math.random().toString(36).slice(-8); 
    //providing a random password to the patient

    req.body.changedBy = username
    
    //now we have everything we need to create the patient in req.body
    const data = JSON.stringify(req.body)
    const args = [data]

    //creating a patient through admin smart contract
    const createPatientRes = await network.invoke(networkObj, false,  'AdminContract:createPatient', args);
    if (createPatientRes.error) {
        return res.status(400).send(createPatientRes.error);
    }

    //'attributes' JSON string in which userId, orgId must be present.
    const orgId = (username === 'org1admin'? '1' : '2')
    const attributes = {firstName : req.body.firstName , lastName : req.body.lastName , role : 'patient'}

    //// Enrol and register the user with the CA and adds the user to the wallet.
    try{
        await enrollRegisterUser(orgId , req.body.patientId , JSON.stringify(attributes))
    }
    catch(error){
        await network.invoke(networkObj, false, 'AdminContract:deletePatient', req.body.patientId);
        return res.send(error);
    }

    //successful creation
    res.status(201).json({msg : 'success' , data : {patientId : req.body.patientId , password : req.body.password}});
}

const createDoctor = async(req , res) => {
    const {username , role} = req.user //admin username and role
    let orgId = req.body.orgId
    let docUsername = req.body.username
    let docPassword = req.body.password

    //adding this data to mongoDB database
    await Collection.create({
        username : docUsername,
        password : docPassword,
        org : orgId,
        role : 'doctor',
        firstName: req.body.firstName,
        lastName : req.body.lastName,
        speciality : req.body.speciality
    })

    const attributes = {firstName : req.body.firstName , lastName : req.body.lastName , role : 'doctor' , speciality : req.body.speciality}
    attributes = JSON.stringify(attributes)
    // Enrol and register the user with the CA and adds the user to the wallet.
    const response = await enrollRegisterUser(orgId , docUsername , attributes)
    if (response.error) {
        await Collection.findOneAndDelete({username : docUsername}) //delete from mongoDB if error
        res.status(400).send(response.error);
    }
    
    //success
    res.status(201).json({msg : 'success' , data : {username : docUsername , password : docPassword}}) 
}

//Retrieves all the assets(patients) in the ledger
const getAllPatients = async(req , res) => {
    const {username , role} = req.user //admin username and role
    const networkObj = await network.connectToNetwork(username);

    //invoke the smart contract
    const response = await network.invoke(networkObj, true , capitalize(role) + 'Contract:queryAllPatients' , '')
    const parsedResponse = await JSON.parse(response);
    res.status(200).send(parsedResponse) //success
}

module.exports = {createPatient, createDoctor , getAllPatients}