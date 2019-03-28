/* eslint-disable no-unused-vars */

class Source {
  /**
  * Fetch a course plan.
  * @param {Any} id - The id of the course to fetch.
  * @returns {Any} The course source.
  */
  async fetchCoursePlan(id) {

  }

  /**
  * Fetch all available courses.
  * @returns {Array} All available courses.
  */
  async fetchCoursePlans() {

  }

  /**
  * Parse a course.
  * @param {Any} source - A source to the course to parse (such as PDF).
  * @returns {Course} A parsed course.
  */
  async parseCoursePlan(source) {

  }

  /**
  * Parse all courses.
  * @param {Array} sources - An array of sources to parse.
  * @returns {Array} An array of parsed courses.
  */
  parseCoursePlans(sources) {
    return Promise.all(sources.map(source => this.parseCoursePlan(source)));
  }
}

module.exports = Source;
