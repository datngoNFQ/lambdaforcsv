'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const csv = require('@fast-csv/parse');
const moment = require('moment');
const multipart = require('aws-lambda-multipart-parser');

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: 'Welcome to upload csv API Endpoint'
  }
  console.log('API Endpoint: Upload csv file');
  return response;
};
