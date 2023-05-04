/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const AdminContract = require('./lib/admin-contract');
const PatientContract = require('./lib/patient-contract');
const PrimaryContract = require('./lib/primary-contract');

module.exports.contracts = [ PrimaryContract , AdminContract , PatientContract];
