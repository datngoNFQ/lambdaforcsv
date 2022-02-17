'use strict';
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const csv = require('@fast-csv/parse');

module.exports.readS3File = async (event) => {
  const Key = event.Records[0].s3.object.key;

    const s3BucketName = event.Records[0].s3.bucket.name;
    const s3ObjectKey = event.Records[0].s3.object.key;
    const params = {
      Bucket: s3BucketName,
      Key: s3ObjectKey,
    };
    const csvFile = s3.getObject(params).createReadStream();

    let csvParser = new Promise((resolve, reject) => {
      const parser = csv
        .parseStream(csvFile, { headers: true })
        .on("data", function (readdata) {
          console.log('Data parsed from CSV: ', readdata);
        })
        .on("end", function () {
          resolve("CSV parsing finished");
        })
        .on("error", function () {
          reject("CSV parsing failed");
        });
    });

    try {
      await csvParser;
    } catch (error) {
      console.log("Get Error: ", error);
    }
    return;
};
