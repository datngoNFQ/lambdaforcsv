'use strict';
const mysql = require('serverless-mysql')();
const moment = require('moment');

exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  console.log('data == ', data);
  const response = {
    statusCode: 200,
    body: JSON.stringify({"message": "Welcome to APPLY a vouncher code from customer"})
  }
  console.log('API Endpoint: APPLY a voucher code');
  return response;
};
