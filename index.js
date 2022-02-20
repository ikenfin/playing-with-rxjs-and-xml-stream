const fs = require('fs');

const { parseCDToFile } = require('./lib/logic');

async function init() {
  const from = './test.xml';
  const to = './songs.csv';

  // drop existing csv file if exists
  if (fs.existsSync(to)) {
    fs.unlinkSync(to);
  }

  const parseResults = await parseCDToFile(from, to);

  // pretty print parse results
  console.table(parseResults);
}

init().catch(console.error);
