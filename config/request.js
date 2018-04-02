const keyConfig = require('./key');

let getGooglePlacesOptions = () => {
	return {
		url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
		method: "GET",
		json: true,
		qs:
			{
				key: keyConfig.googlePlaces
			}
	}
};

let getGithubTokenValidationOptions = () => {
	return {
		url: "https://api.github.com/applications/" + keyConfig.githubClientId + "/tokens/",
		method: "GET",
		headers: {
			'User-Agent': 'request'
		}
	};
};

let getGithubAuthOptions = () => {
	return {
		url: "https://api.github.com/authorizations",
		method: "POST",
		json: true,
		body: {
			client_id: keyConfig.githubClientId,
			client_secret: keyConfig.githubClientSecret,
			note: "TestCaseApp"
		},
		headers: {
			'User-Agent': 'request'
		}
	}
};

module.exports = {
	getGithubAuthOptions: getGithubAuthOptions,
	getGithubTokenValidationOptions: getGithubTokenValidationOptions,
	getGooglePlacesOptions: getGooglePlacesOptions
};