const debug = require('debug')('institute-courses-api:convenience-methods');

/**
* Wait asynchronously.
* @param {Number} min - The minimum wait time.
* @param {Number} max - The maximum wait time.
*/
async function wait(min, max) {
  await new Promise(resolve => {
    setTimeout(resolve, Math.max(Math.floor(Math.random() * min), max));
  });
}

/**
* Fetch courses from all sources asynchronously.
* @param {Source} source - The source (institute) to fetch courses from.
* @param {Object} options - Optional options
* @param {Number} options.parallelRequests - The number of requests to send simultaneously.
* @param {Number} options.minimumDelay - The minimum number of milliseconds to wait between requests.
* @param {Number} options.maximumDelay - The maximum number of milliseconds to wait between requests.
* @param {Number} options.coursesToFetch - The amount of courses to fetch from each source (0 means all). Rounds up to nearest batch.
* @returns {Array} Array of courses.
*/
async function fetchCourses(source, options = {}) {
  options = Object.assign({
    parallelRequests: 3,
    minimumDelay: 100,
    maximumDelay: 1000,
    coursesToFetch: 0
  }, options);

  debug(`Fetching courses using source ${source.constructor.name}`);
  const courses = await source.fetchCourses();
  const batches = [];
  for (let i = 0; i < courses.length; i += options.parallelRequests)
    batches.push(courses.slice(i, i + options.parallelRequests));

  let fetchedCourses = 0;
  for (const batch of batches) {
    debug(`Sending ${batch.length} requests`);
    await Promise.all(batch.map(course => source.fetchCourse(course))); /* eslint no-await-in-loop: "off" */
    debug('Waiting between requests');
    await wait(options.minimumDelay, options.maximumDelay); /* eslint no-await-in-loop: "off" */
    fetchedCourses += batch.length;
    if (fetchedCourses > (options.coursesToFetch || courses.length))
      return courses;
  }

  return courses;
}

module.exports = {
  fetchCourses
};
