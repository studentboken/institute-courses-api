const debug = require('debug')('course-plans');

const sources = require('./sources');

for (const Source of sources) {
  const source = new Source();
  debug(`Fetching course plans using source ${source.constructor.name}`);
  source.fetchCoursePlans().then(coursePlans => {
    console.log(coursePlans);
  });
}
