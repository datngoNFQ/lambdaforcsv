'use strict';
const mysql = require('serverless-mysql')();
const moment = require('moment');

exports.handler = async (event) => {
  console.log('HELLO WORLD');
  const response = {
    statusCode: 200,
    body: 'Welcome to APPLY a vouncher code from customer'
  }
  console.log('API Endpoint: APPLY a voucher code');
  return response;
};
