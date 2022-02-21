'use strict';

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: 'Welcome to APPLY a vouncher code from customer'
  }
  console.log('API Endpoint: APPLY a voucher code');
  return response;
};
