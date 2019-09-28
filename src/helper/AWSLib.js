// **** AWS X-RAY capture **** //
const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWSrequire("aws-sdk");
const REGION = process.env.REGION;
AWS.config.update({region: REGION});

const AWSLib = {};

AWSLib.call = (resource, action, params) => {
  if(resource.includes('DynamoDB')) {
    return new AWS.DynamoDB.DocumentClient()[action](params).promise();
  } else {
    return new AWS[`${resource}`]()[action](params).promise();
  }
};

module.exports = AWSLib;