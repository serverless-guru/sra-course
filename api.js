const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const api = {};

const TABLE_NAME = process.env.TABLE_NAME;

api.handler = async (event) => {
  console.log('event', event);
  console.log('TABLE_NAME', TABLE_NAME);
  let response = {};
  
  try {
    if (event.path.includes('users')) {
        if (event.httpMethod === 'POST') {
            // save user in DynamoDB
            response.body = JSON.stringify(await api.handleCreateUser(JSON.parse(event.body)));
        } else if (event.httpMethod === 'GET') {
            // get user from DynamoDB
            if (event.pathParameters) {
                let userId = event.pathParameters.id;
                response.body = JSON.stringify(await api.handleGetUserById(userId));
            } else {
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
          TableName : TABLE_NAME,
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

api.handleCreateUser = (item) => {
    return new Promise((resolve, reject) => {
        let documentClient = new AWS.DynamoDB.DocumentClient();

        item.user_id = uuidv4();
    
        let params = {
          TableName : TABLE_NAME,
          Item: item
        };
        
        documentClient.put(params, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }); 
    });
};

api.handleUpdateUserById = (userId, item) => {
    return new Promise((resolve, reject) => {
        let documentClient = new AWS.DynamoDB.DocumentClient();
        
        let params = {
          TableName : TABLE_NAME,
          Key: {
            user_id: userId
          },
          UpdateExpression: "set #n = :n, #j = :j",
          ExpressionAttributeValues: {
            ":n": item.name,
            ":j": item.job
          },
          ExpressionAttributeNames: {
              '#n' : 'name',
              '#j': 'job'
          },
          ReturnValues:"UPDATED_NEW"
        };

        documentClient.update(params, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
    });
};

api.handleGetUsers = () => {
    return new Promise((resolve, reject) => {
        let documentClient = new AWS.DynamoDB.DocumentClient();
        
        let params = {
          TableName : TABLE_NAME
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
          TableName : TABLE_NAME,
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

