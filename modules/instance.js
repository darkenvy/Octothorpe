const Request = require('./request');
const _ = require('lodash');

class Instance {
  constructor(name) {
    this.name = name;
    this.tags = [];
  }

  async getTags() {
    const url = `https://${this.name}/api/v1/trends`;
    const response = await new Request({ url }).call();
    const data = _.get(response, 'data', []);

    this.tags = data;

    return data;
  }
}

module.exports = Instance;
