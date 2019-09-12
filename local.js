const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.options("/*", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token, X-Auth-Token');
  res.header('content-type', 'application/json');
  res.status(200).send("{}");
});

app.get('/:resource', handleReq);
app.get('/:resource/:id', handleReq);
app.post('/:resource', handleReq);
app.put('/:resource/:id', handleReq);
app.delete('/:resource/:id', handleReq);

app.listen(5555, () => console.log('listening on 5555...'));

function handleReq(req, res) {
  const resource = req.params.resource;
  const lambda = require(`./api`);
  const idStr = req.params.id ? `/${req.params.id}` : '';
  const prop = req.params.prop ? `/${req.params.prop}` : '';

  const event = {
    resource: `/${resource}`,
    path: `/${resource}${idStr}${prop}`,
    pathParameters: {
      id: req.params.id
    },
    queryStringParameters: req.query,
    httpMethod: req.method,
    headers: req.headers,
    'body': JSON.stringify(req.body),
  };

  res.header('Access-Control-Allow-Origin', '*');
  res.header('content-type', 'application/json');

  lambda.handler(event)
    .then(result => {
      const body = JSON.parse(result.body);
      const status = isNaN(body.status) ? 500 : body.status;
      res.status(status).send(body);
    })
    .catch(err => res.send(err));
}