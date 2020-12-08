require('dotenv').config();
const Nedb = require('nedb');
const path = require('path');
const axios = require('axios');
const _ = require('lodash');

const db = new Nedb({
  filename: path.join(__dirname, 'instances.db'),
  autoload: true,
});

// -------------------------------------------------------------------------- //

const { INSTANCES_SOCIAL_TOKEN } = process.env;
const INSTANCE_LIST_ENDPOINT = 'https://instances.social/api/1.0/instances/list' + 
  '?include_down=false' +
  '&min_active_users=1' +
  '&language=en';// +
  // '&count=10000';

async function request(params) {
  let response = undefined;

  try {
    response = await axios({ ...params });
  } catch(err) {
    console.log(
      'GET error:', 
      _.get(err, 'response.status'),
      _.get(err, 'response.statusText'),
      _.get(err, 'response.data.error.message'),
    );
    response = null;
  }

  return response;
}

async function main() {
  // Query for a list of all Mastodon servers
  const response = await request({
    url: INSTANCE_LIST_ENDPOINT,
    headers: {
      Authorization: `Bearer ${INSTANCES_SOCIAL_TOKEN}`,
    },
  });

  // Filter for only the server name (which is the address)
  const instances = _.get(response, 'data.instances', []);
  const instanceList = instances.map(instance => instance.name);

  // For each server, query it for the list of hashtags
  const tagList = {};
  for (let instanceIdx in instanceList) {
    if (instanceIdx == 5) break;
    const instanceName = instanceList[instanceIdx]
    console.log(`Querying ${instanceIdx} of ${instanceList.length}. ${instanceName}`);

    const url = `https://${instanceName}/api/v1/trends`;
    const response = await request({ url });

    if (!response) continue;

    // clean data
    const data = _.get(response, 'data', []);
    const tags = data.map(tagObject => ({
      name: tagObject.name,
      history: tagObject.history.map(day => parseInt(day.accounts, 10)),
    }));

    /* add tags from the latest query to the master list.
    If the same tag exists already in the master list, then we must merge both
    arrays together. [0,1,2] and [5,6,7] will become [5,7,9].
    */
    tags.forEach(tag => {
      const { name, history } = tag;

      if (name === 'VenezuelaProtegida') console.log('!!!!', instanceName)

      if (tagList[name]) {
        const existingTagList = tagList[name];
        const nextTagList = existingTagList.map((item, idx) => item + history[idx]);
        console.log('merging', name, existingTagList, history, nextTagList)

        tagList[name] = nextTagList;
      } else {
        tagList[name] = history;
      }
    });
  }

  console.log(tagList);
  console.log(Object.keys(tagList).length);
}

(main)();
