'use strict';

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: 'Welcome to upload csv'
  }
  console.log('Worker: Upload csv');
  return response;
};
