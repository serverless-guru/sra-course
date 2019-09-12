const responseLib = {};

responseLib.success = body => {
  return responseLib.buildResponse(200, body);
};

responseLib.failure = body => {
  return buildResponse(500, body);
};
  
responseLib.buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
};

module.exports = responseLib;