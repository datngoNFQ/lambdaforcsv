'use strict';

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: 'Welcome to Read CSV worker'
  }
  console.log('Worker: Read CSV and import to database');
  return response;
};
