const uuidv4 = require('uuid/v4');
const AWSLib = require('../helper/AWSLib')
const REGION = process.env.REGION;
AWS.config.update({region: REGION});
const api = {};

const 
const TABLE_NAME = process.env.TABLE_NAME;

api.handler = async (event) => {
  console.log('event', event);
  let response = {};

  try {
    if (event.path.includes('users')) {
      if (event.httpMethod === 'POST') {
        // save user in DynamoDB
        response.body = JSON.stringify(await api.handleCreateUser(JSON.parse(event.body)));
      } else if (event.httpMethod === 'GET') {
        // get user from DynamoDB
        if (event.pathParameters) {
          if(event.pathParameters.id) {
            let userId = event.pathParameters.id;
            response.body = JSON.stringify(await api.handleGetUserById(userId));
          }
        } else {
          console.log('running handleGetUsers');
          response.body = JSON.stringify(await api.handleGetUsers());
        }
      } else if (event.httpMethod === 'PUT') {
        // update user in DynamoDB
        let userId = event.pathParameters.id;
        response.body = JSON.stringify(await api.handleUpdateUserById(userId, JSON.parse(event.body)));
      } else if (event.httpMethod === 'DELETE') {
        // delete user in DynamoDB
        let userId = event.pathParameters.id;
        response.body = JSON.stringify(await api.handleDeleteUserById(userId));
      }
    }
    response.statusCode = 200;
  } catch (e) {
    response.body = JSON.stringify(e);
    response.statusCode = 500;
  }
  response.headers = {
    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  };
  console.log('response', response);
  return response;
};

api.handleDeleteUserById = (userId) => {
  return new Promise((resolve, reject) => {
    let documentClient = new AWS.DynamoDB.DocumentClient();

    let params = {
      TableName: TABLE_NAME,
      Key: {
        user_id: userId
      }
    };

    documentClient.delete(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

api.handleCreateUser = async item => {
  console.log('item', item);

  item.user_id = uuidv4();

  if (item.image) {
    let S3_BUCKET = process.env.S3_BUCKET;
    let ext = item.image.split(';')[0].split('/')[1];
    let key = `profile/${item.user_id}/profile.${ext}`;
    let S3_URL = `https://${S3_BUCKET}.s3-${REGION}.amazonaws.com/${key}`;
    let buf = new Buffer.from(item.image.replace(/^data:image\/\w+;base64,/, ""),'base64');
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
  let ddbParams = {
    TableName: TABLE_NAME,
    Item: item
  };
  let ddbResponse = await documentClient.put(ddbParams);
  console.log('ddbResponse', ddbResponse);

  return ddbResponse;
};

api.handleUpdateUserById = (userId, item) => {
  return new Promise((resolve, reject) => {

    let s3 = new AWS.S3();
    let documentClient = new AWS.DynamoDB.DocumentClient();

    if (item.image) {
      // upload image to S3
      let S3_BUCKET = process.env.S3_BUCKET;
      let ext = item.image.split(';')[0].split('/')[1];
      let key = `profile/${item.user_id}/profile.${ext}`;
      let S3_URL = `https://${S3_BUCKET}.s3-${REGION}.amazonaws.com/${key}`;
      let buf = new Buffer.from(item.image.replace(/^data:image\/\w+;base64,/, ""),'base64');
      let params = {
        ACL: "public-read",
        Body: buf,
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: `image/${ext}`
      };
      console.log('params', params);
      s3.putObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log('s3 data', data);
          delete item.ext;
          delete item.image;
          item.image_url = S3_URL;
          
          let params = {
            TableName: TABLE_NAME,
            Key: {
              user_id: userId
            },
            UpdateExpression: "set #n = :n, #j = :j, #i = :i",
            ExpressionAttributeValues: {
              ":n": item.name,
              ":j": item.job,
              ":i": item.image_url
            },
            ExpressionAttributeNames: {
              '#n': 'name',
              '#j': 'job',
              '#i': 'image_url'
            },
            ReturnValues: "UPDATED_NEW"
          };

          console.log('ddb params', ddbParams);
          documentClient.update(params, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        }
      });
    }
  });
};

api.handleGetUsers = () => {
  return new Promise((resolve, reject) => {
    console.log('--IN api.handleGetUsers()');
    let documentClient = new AWS.DynamoDB.DocumentClient();

    let params = {
      TableName: TABLE_NAME
    };

    documentClient.scan(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

api.handleGetUserById = (userId) => {
  return new Promise((resolve, reject) => {
    let documentClient = new AWS.DynamoDB.DocumentClient();

    let params = {
      TableName: TABLE_NAME,
      Key: {
        user_id: userId
      }
    };

    documentClient.get(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

module.exports = api;
