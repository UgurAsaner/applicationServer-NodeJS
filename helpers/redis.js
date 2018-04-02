let redis = require('redis');
let redisClient = redis.createClient();

module.exports = {
	set: set,
	get: get
};

function set (prefix, object) {
	let jsonElement = JSON.stringify(object);
	redisClient.set(prefix, jsonElement);
}

function get (prefix, cb) {
	redisClient.get(prefix, (error, result) => {
		if(result){
			cb(error, JSON.parse(result));
		}else{
			cb(error, result);
		}
	});
}
