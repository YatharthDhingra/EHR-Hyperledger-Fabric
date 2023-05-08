const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Collection = require('../../db_models/model.js')
const network = require('../../../../test-application/javascript/app.js')

const JWT_SECRET = 'secret'

const login = async(req , res) => {
    let {username , password , orgId , role} = req.body
    orgId = parseInt(orgId)
    let userExists = false

    if(role === 'admin' || role === 'doctor'){
        //then verify from mongoDB
        const findUser = await Collection.findOne({username : username})
        if(findUser.password === password) userExists = true 
    }

    if(role == 'patient'){
        const networkObj = network.connectToNetwork(username)
        const value = crypto.createHash('sha256').update(password).digest('hex')
        //isQuery -> true , username -> PIDx
        const savedPassword = await network.invoke(networkObj , true , 'PatientContract:getPatientPassword' , username)
        if(savedPassword.toString('utf8') === value){
            userExists = true
        }
    }

    if(userExists){
        //if user Found
        //payload is {username , role}
        const token = jwt.sign({username , role} , JWT_SECRET , {expiresIn : '10m'})
        res.status(200).json({token})  //send jwt response which will be authenticated when you login
    }
    else{
        //if user not found
        res.status(400).send({error: 'Username or password incorrect!'});
    }
}