class Course {
  constructor() {
    // Information that's not expected to always be available from all sources
    this.other = {};

    // Whether or not the course can be applied to
    this.other.appliable = null;

    // The course code to apply to on antagning.se
    this.other.applicationCode = null;

    // The semester the course starts (such as 'VT-19')
    this.other.start = null;

    // The amount of "Högskolepoäng (HP)" the course consists of
    this.other.points = null;

    // The topic of the course, such as 'Mathematics'
    this.other.topic = null;

    // Name of the course
    this.name = null;

    // URL to the course page
    this.url = null;

    // The course code, such as 'MA1445'
    this.code = null;

    // Book ISBNs included in the course
    this.books = [];

    // The source institute (such as BTH)
    this.source = null;
  }
}

module.exports = Course;
