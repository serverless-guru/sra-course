const AWS = require("aws-sdk");
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