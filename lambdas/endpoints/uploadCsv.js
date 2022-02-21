'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const csv = require('@fast-csv/parse');
const moment = require('moment');
const multipart = require('aws-lambda-multipart-parser');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  console.log('BEGIN file upload handling');
  try {
    const spotText = true; // all text files are present in text for after parsing
    const deta = multipart.parse(event, spotText);
    const s3BucketName = process.env.S3BUCKET;
    const uuid = uuidv4();
    const s3ObjectKey = `${process.env.FILENAME}_${uuid}`;

    const params = {
      Bucket: s3BucketName,
      Body: deta.file.content,
      Key: s3ObjectKey,
    };

    const newData = await s3.putObject(params).promise();
    if (!newData) {
      throw Error('there was an error writing the file');
    }

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
