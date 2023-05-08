const fs = require('fs');
const {enrollAdminOrg1} = require('./enrollAdmin-org1.js')
const {enrollAdminOrg2} = require('./enrollAdmin-org2.js')
const {enrollRegisterUser} = require('./registerUser.js')

const connectDB = require('./db/connect');
const Collection = require('./db_models/model.js')
require('dotenv').config();

//Enrolls and registers patients as clients
//it doesn't inits in couchDB as it is done when chaincode is deployed
async function initLedger() {
    try {
      const jsonString = fs.readFileSync('../../chaincode/fabcar/javascript/lib/initLedger.json'); //read patient data 
      const patients = JSON.parse(jsonString);
      for (let i = 0; i < patients.length; i++) {
        const attr = {firstName: patients[i].firstName, lastName: patients[i].lastName, role: 'patient'}; //set attr
        await enrollRegisterUser('1', 'PID'+i, JSON.stringify(attr)); //register patient (orgId , userId , attributes)
        //inits as org1 patient
      }
    } catch (err) {
      console.log(err);
    }
}

async function initDB(){
    await connectDB(process.env.MONGO_URL);
    //deleting the old data
    await Collection.deleteMany()
    //now we store data of admins in mongodb
    const admin1 = {
        username : 'org1admin',
        password : 'adminpw',
        org : '1',
        role : 'admin'
    }
    const admin2 = {
        username : 'org2admin',
        password : 'adminpw',
        org : '2',
        role : 'admin'
    }
    //creating documents
    await Collection.create(admin1)
    await Collection.create(admin2) 
}

//creating doctor identity in wallet and also storing data in mongoDB
async function enrollAndRegisterDoctors() {
    try {
      const jsonString = fs.readFileSync('./initDoctors.json');
      const doctors = JSON.parse(jsonString);
      for (let i = 0; i < doctors.length; i++) {
        const attr = {firstName: doctors[i].firstName, lastName: doctors[i].lastName, role: 'doctor', speciality: doctors[i].speciality};
        doctors[i].orgId = parseInt(doctors[i].orgId);
        const name = 'HOSP' + doctors[i].orgId + '-' + 'DOC' + i
        await Collection.create({
            username : name,
            password : 'password',
            org : doctors[i].orgId,
            role : 'doctor',
            firstName : doctors[i].firstName,
            lastName : doctors[i].lastName,
            speciality : doctors[i].speciality
        })
        await enrollRegisterUser(doctors[i].orgId, name, JSON.stringify(attr));
      }
    } catch (error) {
      console.log(error);
    }
  }


  async function main() {
    await enrollAdminOrg1();
    await enrollAdminOrg2();
    await initLedger();
    await initDB();
    await enrollAndRegisterDoctors();
  }

main()
