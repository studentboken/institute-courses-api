const debug = require('debug')('course-plans:app');

const sources = require('./sources');

// The number of sources to process simultaneously
const PARALLEL_SOURCES = 1;
// The number of requests to send simultaneously
const PARALLEL_REQUESTS = 3;
// The number of milliseconds to wait between requests
const MINIMUM_DELAY = 100;
const MAXIMUM_DELAY = 1000;
// The amount of courses to fetch from each source (0 means all)
// Rounds up to nearest batch
const COURSES_TO_FETCH = 10;

function wait(min, max) {
  return new Promise(resolve => {
    setTimeout(resolve, Math.max(Math.floor(Math.random() * min), max));
  });
}

async function fetchCourses(source) {
  debug(`Fetching courses using source ${source.constructor.name}`);
  const courses = await source.fetchCourses();
  const batches = [];
  for (let i = 0; i < courses.length; i += PARALLEL_REQUESTS)
    batches.push(courses.slice(i, i + PARALLEL_REQUESTS));

  let fetchedCourses = 0;
  for (const batch of batches) {
    debug(`Sending ${batch.length} requests`)
    await Promise.all(batch.map(course => source.fetchCourse(course)));
    debug('Waiting between requests');
    await wait(MINIMUM_DELAY, MAXIMUM_DELAY);
    fetchedCourses += batch.length;
    if (fetchedCourses > (COURSES_TO_FETCH || courses.length))
      return courses;
  }

  return courses;
}

async function main() {
  const batches = [];
  for (let i = 0; i < sources.length; i += PARALLEL_SOURCES)
    batches.push(sources.slice(i, i + PARALLEL_SOURCES));

  const courses = [];

  for (const batch of batches) {
    debug(`Processing batch of ${batch.length} sources`);

    const results = await Promise.all(batch.map(Source => fetchCourses(new Source())));
    const entries = results.reduce((res, x) => res + x.length, 0);
    debug(`Retrieved ${entries} entries from ${batch.length} sources`);
    for (const result of results)
      courses.push(...result);
  }

  console.log(courses);
}

main();
