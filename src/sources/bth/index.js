const axios = require('axios');
const cheerio = require('cheerio');
const debug = require('debug')('institute-courses-api:bth');
const iconv = require('iconv-lite');
const isISBN = require('is-isbn').validate;

const Source = require('../source');
const Course = require('../../course');

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

      const course = new Course();

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
