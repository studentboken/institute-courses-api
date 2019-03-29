const axios = require('axios');
const cheerio = require('cheerio');
const debug = require('debug')('course-plans:bth');
const iconv = require('iconv-lite');
const isISBN = require('is-isbn').validate;

const Source = require('../source');

const COURSE_PLANS_URL = 'http://edu.bth.se/utbildning/utb_sok_resultat.asp?KtTermin=fore&KtTermin=inne&KtTermin=nast&PtStartTermin=fore&PtStartTermin=inne&PtStartTermin=nast';

class BTH extends Source {
  async fetchCourse(course) {
    debug('Fetching course');
    const response = await axios.get(course.url, {responseType: 'arraybuffer'});
    const data = iconv.decode(response.data, 'ISO-8859-1');

    debug('Parsing result');
    const $ = cheerio.load(data);

    course.code = $('#utb_kurstitel').text().trim().split(' ')[0];

    $('.KPInnehall').each((_, element) => {
      const text = $(element).text().trim();
      // Assume that no other text will follow the same format (none seems to do so)
      const books = text.match(/[0-9-]{9,17}x?/gi);
      if (books)
        course.books = [...course.books, ...books.map(x => x.replace(/-/g, ''))];
    });

    // Remove duplicates and faulty codes
    course.books = course.books.reduce((res, x) => {
      if (!res.includes(x))
        res.push(x);
      return res;
    }, []).filter(x => isISBN(x));

    $('.utb_faktaspalt_rubrik').each((_, element) => {
      const header = $(element);
      if (header.text().trim() === 'Huvudområde')
        course.other.topic = header.next().text().trim();
    });

    return course;
  }

  async fetchCourses() {
    debug('Fetching courses');
    const response = await axios.get(COURSE_PLANS_URL, {responseType: 'arraybuffer'});
    const data = iconv.decode(response.data, 'ISO-8859-1');

    debug('Parsing results');
    const courses = [];
    const $ = cheerio.load(data);
    $('#utb_kurser tr').each((rowIndex, element) => {
      // The first row contains headers - skip it
      if (rowIndex < 1)
        return;

      const row = $(element);
      if (row.children().length !== 4)
        return;

      const course = {
        other: {
          appliable: false, // Whether or not the course can be applied to
          applicationCode: null, // The course code to apply to on antagning.se
          start: null, // The semester the course starts (such as 'VT-19')
          points: null, // The amount of "Högskolepoäng (HP)" the course consists of
          topic: null // The topic of the course, such as 'Mathematics'
        },
        name: null, // Name of the course
        url: null, // URL to the course page
        code: null, // The course code, such as 'MA1445'
        books: [], // Book ISBNs included in the course
        source: 'bth'
      };

      row.children().each((columnIndex, element) => {
        const column = $(element);
        if (columnIndex === 0)
          course.other.appliable = column.text().trim() !== 'Ej sökbar';
        if (columnIndex === 1) {
          const linkTag = $(column).children().first();
          const title = linkTag.attr('title').trim();
          const split = title.split(' ');
          course.name = split.slice(0, split.length - 2).join(' ');
          course.other.points = Number(split.slice(-2, -1)[0].replace(',', '.'));
          const href = linkTag.attr('href');
          course.url = 'http://edu.bth.se/utbildning/' + href;
          course.other.applicationCode = href.match(/KtAnmKod=([^&"]+)/)[1];
        }
        if (columnIndex === 3)
          course.other.start = column.text().trim();
      });

      courses.push(course);
    });

    return courses;
  }
}

module.exports = BTH;
