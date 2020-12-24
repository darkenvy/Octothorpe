const Request = require('./request');
const Instance = require('./instance');
const TagCollection = require('./tagCollection');
const _ = require('lodash');

class Instances {
  constructor() {
    const { INSTANCES_SOCIAL_TOKEN, INSTANCE_LIST_ENDPOINT } = process.env;
    this.instanceSocialToken = _.get(arguments, 'instanceSocialToken', INSTANCES_SOCIAL_TOKEN);
    this.instanceListEndpoint = _.get(arguments, 'instanceListEndpoint', INSTANCE_LIST_ENDPOINT);
    this.list = [];
    this.tagCollection = new TagCollection();
  }

  /* for loops are very friendly with async/await. Avoid forEach/map loops */
  async requestTagsFromInstances() {
    for (let idx in this.list) {
      if (idx == 3) break; // todo: debug
      console.log(`Querying ${idx} of ${this.list.length}. ${this.list[idx].name}`);

      const instance = this.list[idx];
      const tags = await instance.getTags();

      this.tagCollection.add(tags);
    }

    return this;
  }

  // Query for a list of all Mastodon servers
  async requestInstances() {
    const response = await new Request({
      url: this.instanceListEndpoint,
      headers: {
        Authorization: `Bearer ${this.instanceSocialToken}`,
      },
    }).call();

    const instances = _.get(response, 'data.instances', []);
    const list = instances.map(instance => instance && new Instance(instance.name));

    this.response = response;
    this.list = list;

    return this;
  }
}

module.exports = Instances;
