const generic = {};

generic.success = body => {
  return generic.buildResponse(200, body);
};

generic.failure = body => {
  return generic.buildResponse(500, body);
};
  
generic.buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
};

generic.buildDDBUpdate = item => {
  return new Promise((resolve, reject) => {
    let updateExpression = 'set ';
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};
    Object.keys(item).forEach((key) => {
      updateExpression += `#${key} = :${key}, `;
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = item[key];
    });
    updateExpression = updateExpression.substring(0, updateExpression.length - 2);
    resolve({
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues
    });
  });
};

module.exports = generic;