'use strict';
const AWS = require('aws-sdk'); // LG: is not required in your package.json ?!
const s3 = new AWS.S3();
const csv = require('@fast-csv/parse'); // LG: is not required in your package.json ?! also, UNUSED here
const moment = require('moment'); // LG: unused
const multipart = require('aws-lambda-multipart-parser');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  console.log('BEGIN file upload handling');
  try {
    const spotText = true; // all text files are present in text for after parsing // LG: useless variable / constant
    const deta = multipart.parse(event, spotText); // LG: just pass true as second argument here; TYPO in "data"
    const s3BucketName = process.env.S3BUCKET;
    const uuid = uuidv4();
    const s3ObjectKey = `${process.env.FILENAME}_${uuid}`; // LG: I would at least put the original filename into the new filename; How would you find this file again - in case something went wrong or w/e

    const params = {
      Bucket: s3BucketName,
      Body: deta.file.content,
      Key: s3ObjectKey,
    };

    const newData = await s3.putObject(params).promise();
    if (!newData) { // LG: is never falsy, as the .promise() returns a PromiseResult object
      throw Error('there was an error writing the file');
    }

  } catch(e) {
    console.log(e);
  }

  const response = {
    statusCode: 201,
    body: JSON.stringify({"message": "File is uploaded!"}) // LG: always responding with success?! What if it is not successful (e.g. ll 26)
  };
  console.log('END file upload handling');
  return response;
};
