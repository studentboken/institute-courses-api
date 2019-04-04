#! /usr/bin/env node

const fs = require('fs');

const debug = require('debug')('institute-courses-api:app');
const yargs = require('yargs');

const sources = require('./sources');
const {fetchCourses} = require('./convenience-methods');

async function main(argv) {
  if (argv.debug)
    require('debug').enable('institute-courses-api:*');

  const batches = [];
  for (let i = 0; i < sources.length; i += argv.parallelSources)
    batches.push(sources.slice(i, i + argv.parallelSources));

  const courses = [];

  for (const batch of batches) {
    debug(`Processing batch of ${batch.length} sources`);

    const results = await Promise.all(batch.map(Source => fetchCourses(new Source(), argv))); /* eslint no-await-in-loop: "off" */
    const entries = results.reduce((res, x) => res + x.length, 0);
    debug(`Retrieved ${entries} entries from ${batch.length} sources`);
    for (const result of results)
      courses.push(...result);
  }

  if (argv.output) {
    debug('Writing results to file');
    fs.writeFileSync(argv.output, JSON.stringify(courses, null, 2));
  } else {
    console.log(JSON.stringify(courses, null, 2));
  }
}

// Parse command line options and run main
yargs
  .usage('Usage: $0 <options>')
  .epilogue('A tool for fetching courses from various institutes.')
  .version('version', require('../package.json').version)
  .option('parallel-sources', {describe: 'The number of sources to process simultaneously', default: 1})
  .option('parallel-requests', {describe: 'The number of requests to send simultaneously', default: 3})
  .option('minimum-delay', {describe: 'The minimum number of milliseconds to wait between requests', default: 100})
  .option('maximum-delay', {describe: 'The maximum number of milliseconds to wait between requests', default: 1000})
  .option('courses-to-fetch', {alias: 'n', describe: 'The amount of courses to fetch from each source (0 means all). Rounds up to nearest batch', default: 0})
  .option('output', {alias: 'o', describe: 'Path to the output file'})
  .option('debug', {alias: 'd', type: 'boolean', describe: 'Run in debugging mode'})
  .example('institute-courses-api --help', 'Show this help page')
  .example('institute-courses-api --output courses.json')
  .recommendCommands()
  .command('$0', 'Fetch courses', () => {}, main).parse();
