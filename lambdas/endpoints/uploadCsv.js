'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const csv = require('@fast-csv/parse');
const moment = require('moment');
const multipart = require('aws-lambda-multipart-parser');

exports.handler = async (event) => {
  console.log('BEGIN file upload handling');
  console.log('event == ', event);
  console.log('event body == ', event.body);
  console.log('event typeof body == ', typeof event.body);
  // console.log('event.body.filename == ', event.body.filename); // undefined
  // const data = JSON.parse(event.body);
  // console.log('data == ', data);
  try {
    const spotText = true; // all text files are present in text for after parsing
    const deta = multipart.parse(event, spotText);
    const s3BucketName = "import-csv-with-lambda-rev1";
    const s3ObjectKey = "myvouchers.csv";

    const params = {
      Bucket: s3BucketName,
      Body: deta.file.content,
      Key: s3ObjectKey,
    };

    const newData = await s3.putObject(params).promise();
    if (!newData) {
      throw Error('there was an error writing the file');
    }
    // END s3 write

  } catch(e) {
    console.log(e);
  }

  const response = {
    statusCode: 201,
    body: JSON.stringify({"message": "File is uploaded!"})
  };
  console.log('END file upload handling');
  return response;
};
