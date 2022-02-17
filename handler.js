'use strict';
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const csv = require('@fast-csv/parse');

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.readS3File = async (event) => {
  const Key = event.Records[0].s3.object.key;

    // Read the object from S3
    const data = await s3.getObject({
        Bucket: event.Records[0].s3.bucket.name,
        Key
    }).promise();

    // const s3Object = JSON.parse(data.Body) -- disabled due to no more needed
    // console.log("s3Object", s3Object); -- disabled due to no more needed
    // -- begin inspecting

    event.Records.forEach((item) => {
      console.log(item);
    });
    // -- end inspecting

    return;
};
