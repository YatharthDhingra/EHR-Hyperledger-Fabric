//Class to set up a patient
const crypto = require('crypto');

class Patient {

    constructor(patientId, firstName, lastName, password, age, phoneNumber, address, bloodGroup,
        changedBy = '', allergies = '', symptoms = '', diagnosis = '', treatment = '', followUp = '')
    {
        this.patientId = patientId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = crypto.createHash('sha256').update(password).digest('hex');
        this.age = age;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.bloodGroup = bloodGroup;
        this.changedBy = changedBy;
        this.allergies = allergies;
        this.symptoms = symptoms;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.followUp = followUp;
        this.permissionGranted = [];
        return this;
    }
}
module.exports = Patient