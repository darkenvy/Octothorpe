require('dotenv').config();
const Instances = require('./modules/instances');

// -------------------------------------------------------------------------- //

async function main() {
  let tags = {};
  const instances = new Instances();

  await instances.requestInstances();
  await instances.requestTagsFromInstances();

  tags = instances.tagCollection.get();

  console.log('tags', tags);
}

(main)();
