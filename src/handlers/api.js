const AWSLib = require('../helper/AWSLib');
const uuidv4 = require('uuid/v4');
const generic = require('../helper/generic');

const api = {};

const TABLE_NAME = process.env.TABLE_NAME;
const REGION = process.env.REGION;

/**
 * All lambda events start here and branch out
 * @param {Object} event has info about trigger
 * @returns {Object} response to client with data and headers
 */
api.handler = async event => {
  console.log('event', event);

  let responseBody = {};

  try {
    if (event.path.includes('users')) {
      if (event.httpMethod === 'POST') {
        // save user in DynamoDB
        responseBody = await api.handleCreateUser(JSON.parse(event.body));
      } else if (event.httpMethod === 'GET') {
        // get user from DynamoDB
        if (event.pathParameters) {
          responseBody = await api.handleGetUserById(event.pathParameters.id);
        } else {
          responseBody = await api.handleGetUsers();
        }
      } else if (event.httpMethod === 'PUT') {
        // update user in DynamoDB
        responseBody = await api.handleUpdateUserById(event.pathParameters.id, JSON.parse(event.body));
      } else if (event.httpMethod === 'DELETE') {
        // delete user in DynamoDB
        responseBody = await api.handleDeleteUserById(event.pathParameters.id);
      }
    }
    return generic.success(responseBody);
  } catch (e) {
    return generic.failure(e);
  }
};

/**
 * Delete user from database by id
 * @param {String} userId id of user
 * @returns {Object} user_id that was deleted and message
 */
api.handleDeleteUserById = async userId => {
  let params = {
    TableName: TABLE_NAME,
    Key: { user_id: userId }
  };
  await AWSLib.call('DynamoDB', 'delete', params);
  return { user_id: userId, message: 'User was deleted' };
};

/**
 * Update users in the database by id
 * - stores S3 image
 * - stores DynamoDB record with S3 image_url
 * @param {Object} item request object to store in database
 * @returns {Object} Item sent to database
 */
api.handleCreateUser = async item => {
  item.user_id = uuidv4();

  if (item.image) {
    // upload image to S3
    let S3_BUCKET = process.env.S3_BUCKET;
    let ext = item.image.split(';')[0].split('/')[1];
    let key = `profile/${item.user_id}/profile.${ext}`;
    let S3_URL = `https://${S3_BUCKET}.s3-${REGION}.amazonaws.com/${key}`;
    let buffer = new Buffer.from(item.image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    let s3Params = {
      ACL: "public-read",
      Body: buffer,
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: `image/${ext}`
    };

    let s3Response = await AWSLib.call('S3', 'putObject', s3Params);
    console.log('s3Response', s3Response);

    delete item.ext; // .png | .jpg
    delete item.image; // base64 encoded string
    item.image_url = S3_URL;
  }

  let ddbParams = {
    TableName: TABLE_NAME,
    Item: item
  };

  let ddbResponse = await AWSLib.call('DynamoDB', 'put', ddbParams);
  console.log('ddbResponse', ddbResponse);
  return { Item: item };
};


/**
 * Update users in the database by id
 * - stores S3 image
 * - stores DynamoDB record with S3 image_url
 * @param {String} userId id of user
 * @param {Object} item request object to store in database
 * @returns {Object} response from database
 */
api.handleUpdateUserById = async (userId, item) => {
  if (item.image) {
    // upload image to S3
    let S3_BUCKET = process.env.S3_BUCKET;
    let ext = item.image.split(';')[0].split('/')[1];
    let key = `profile/${userId}/profile.${ext}`;
    let S3_URL = `https://${S3_BUCKET}.s3-${REGION}.amazonaws.com/${key}`;
    let buf = new Buffer.from(item.image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    let s3Params = {
      ACL: "public-read",
      Body: buf,
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: `image/${ext}`
    };
    let s3Response = await AWSLib.call('S3', 'putObject', s3Params);
    console.log('s3Response', s3Response);

    delete item.ext;
    delete item.image;
    item.image_url = S3_URL;
  }

  console.log('before buildDDBUpdate');

  let { updateExpression,
    expressionAttributeNames,
    expressionAttributeValues } = await generic.buildDDBUpdate(item);

  console.log('after buildDDBUpdate');

  let ddbParams = {
    TableName: TABLE_NAME,
    Key: {
      user_id: userId
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: "UPDATED_NEW"
  };
  console.log('ddbParams', ddbParams);

  let ddbResponse = await AWSLib.call('DynamoDB', 'update', ddbParams);
  console.log('ddbResponse', ddbResponse);

  return ddbResponse;
};

/**
 * Get all users from the database
 * @returns {Object} array of users from database
 */
api.handleGetUsers = async () => await AWSLib.call('DynamoDB', 'scan', { TableName: TABLE_NAME });

/**
 * Get user by id from the database
 * @param {String} userId id of user
 * @returns {Object} data from database
 */
api.handleGetUserById = async userId => {
  return await AWSLib.call('DynamoDB', 'get', {
    TableName: TABLE_NAME,
    Key: { user_id: userId }
  });
};

module.exports = api;

