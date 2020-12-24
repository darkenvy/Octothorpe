const _ = require('lodash');
const axios = require('axios');

class Request {
  constructor(parameters) {
    this.parameters = parameters;
  }

  async call() {
    try {
      this.response = await axios(this.parameters);
    } catch(err) {
      console.log(
        'GET error:', 
        _.get(err, 'response.status'),
        _.get(err, 'response.statusText'),
        _.get(err, 'response.data.error.message'),
      );

      this.response = null; // todo: return just 'this' to allow chaining?
    }

    return this.response;
  }
}

module.exports = Request;
