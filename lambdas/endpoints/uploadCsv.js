'use strict';

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: 'Welcome to upload csv API Endpoint'
  }
  console.log('API Endpoint: Upload csv file');
  return response;
};
