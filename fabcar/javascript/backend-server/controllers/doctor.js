const network = require('../../../../test-application/javascript/app.js')
const Collection = require('../../db_models/model.js')

//Updates an existing asset(patient medical details) in the ledger. This method can be executed only by the doctor.
const updatePatientMedicalDetails = async(req , res) => {
    const {username , role} = req.user

    let args = req.body
    args.patientId = req.params.patientId
    args.changedBy = username
    args= [JSON.stringify(args)];

    const networkObj = await network.connectToNetwork(username);

    const response = await network.invoke(networkObj, false, capitalize(role) + 'Contract:updatePatientMedicalDetails', args);
    if(response.error){
        return res.status(500).send(response.error)
    }
    res.status(200).send('success')
}

//This method retrives an existing doctor
const getDoctorById = async(req , res) => {
    const {username , role} = req.user

    const docId = req.params.doctorId
    const document = await Collection.findOne({username : docId})

    const data = {username : document.username , firstName : document.firstName , lastName : document.lastName , speciality : document.speciality}
    res.status(200).send(data)
}

module.exports = {updatePatientMedicalDetails,getDoctorById}