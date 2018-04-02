const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const routeFunctions = require('./helpers/routeFunctions');


server.listen(8070);
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', routeFunctions.authenticateViaGithub);
app.get('/', routeFunctions.validateGithubToken, routeFunctions.sendResponse);
