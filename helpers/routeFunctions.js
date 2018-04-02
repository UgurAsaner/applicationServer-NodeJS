const requester = require('request');
const requestConfig = require('../config/request');
const keyConfig = require('../config/key');
const redisHelper = require('./redis');
const async = require('async');


function authenticateViaGithub(request, response) {

	let username = request.body.username;
	let password = request.body.password;

	if(username && password) {

		let requestOptions = requestConfig.getGithubAuthOptions();
		let auth = new Buffer(username + ':' + password).toString('base64');

		requestOptions.headers.Authorization = 'Basic ' + auth;

		requester(requestOptions, handleResponse);

		function handleResponse(githubError, githubResponse, githubBody) {

			if(githubError) {
				console.log('Github OAuth Error:\n', githubError || githubResponse);
				response.sendStatus(500);
			}else if(githubResponse.statusCode == 401) {
				console.log('Bad Credentials');
				response.sendStatus(401);
			}else if(githubResponse.statusCode == 200) {
				response.send(githubBody.token);
			}
			else {
				console.log('Unknown Error Occurred: \n', githubBody || githubResponse);
				response.sendStatus(500);
			}
		}
	}
	else{
		console.log('Missing Credentials');
		response.sendStatus(400);
	}
}

function validateGithubToken(request, response, next){

	let token = request.headers.token;

	if(token){
		let auth = new Buffer(keyConfig.githubClientId + ':' + keyConfig.githubClientSecret).toString('base64');
		let requestOptions = requestConfig.getGithubTokenValidationOptions();

		requestOptions.url += token;
		requestOptions.headers.Authorization = 'Basic ' + auth;

		requester(requestOptions, handleResponse);

		function handleResponse(githubError, githubResponse, githubBody) {

			if(githubError){
				console.log('Github Token Check Error:\n', githubError || githubResponse);
				response.sendStatus(500);
			}else if(githubResponse.statusCode == 404){
				console.log('Github Token is not Valid');
				response.sendStatus(401);
			}else if(githubResponse.statusCode == 200){
				next();
			}else{
				console.log('Unknown Error Occurred:\n', githubBody || githubResponse);
				response.sendStatus(500);
			}
		}
	}
}

function sendResponse(request, response){

	let params = getParamsFromRequest(request);

	async.autoInject({
		params: [async.constant(params)],
		response: [async.constant(response)],
		cachedResult: ['params', getCachedResult],
		callGooglePlacesApi: ['cachedResult', 'params', 'response', callGooglePlacesApi]
	});
}

function getCachedResult(params, cb){
	let prefix = params.latitude + ':' + params.longitude + ':' + params.radius;
	redisHelper.get(prefix, cb);
}

function callGooglePlacesApi(cachedResult, params, response){

	if(cachedResult) {
		response.send(cachedResult);
	}else {
		let latitude = params.latitude;
		let longitude = params.longitude;
		let radius = params.radius;

		let requestOptions = requestConfig.getGooglePlacesOptions();

		requestOptions.qs.location = latitude + "," + longitude;
		requestOptions.qs.radius = radius;

		requester(requestOptions, (placesError, placesResponse, placesBody) => {

			if(placesBody.error_message || placesError) {
				console.log(placesBody.error_message || "Places API Error:\n" + placesError);
				response.sendStatus(500);
			}else if(placesBody.status == 'OK') {
				response.send(placesBody.results);
				let prefix = latitude + ':' + longitude + ':' + radius;
				redisHelper.set(prefix, placesBody.results);
			}
			else{
				console.log('Unknown Error Occured:\n', placesBody || placesResponse);
				response.sendStatus(500);
			}
		});
	}
}

function getParamsFromRequest(request){

	if(request.query) {
		return {
			latitude: request.query.latitude,
			longitude: request.query.longitude,
			radius: request.query.radius
		};
	}
}


module.exports = {
	authenticateViaGithub: authenticateViaGithub,
	validateGithubToken: validateGithubToken,
	sendResponse
};
