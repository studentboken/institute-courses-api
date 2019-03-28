const axios = require('axios');
const cheerio = require('cheerio');
const debug = require('debug')('course-plans:bth');
const iconv = require('iconv-lite');

const Source = require('../source');

const COURSE_PLANS_URL = 'http://edu.bth.se/utbildning/utb_sok_resultat.asp?KtTermin=fore&KtTermin=inne&KtTermin=nast&PtStartTermin=fore&PtStartTermin=inne&PtStartTermin=nast';

class BTH extends Source {
  async fetchCoursePlan(id) {

  }

  async fetchCoursePlans() {
    debug('Fetching course plans');
    const response = await axios.get(COURSE_PLANS_URL, {responseType: 'arraybuffer'});
    const data = iconv.decode(response.data, 'ISO-8859-1');

    debug('Parsing results');
    const courses = [];
    const $ = cheerio.load(data, {decodeEntities: false});
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
          points: null // The amount of "Högskolepoäng (HP)" the course consists of
        },
        name: null,
        page: null
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
          course.other.points = Number(split.slice(-2, -1));
          const href = linkTag.attr('href');
          course.page = 'http://edu.bth.se/utbildning/' + href;
          course.other.applicationCode = href.match(/KtAnmKod=([^&"]+)/)[1];
        }
        if (columnIndex === 3)
          course.other.start = column.text().trim();
      });

      courses.push(course);
    });

    return courses;
  }

  async parseCoursePlan(source) {

  }
}

module.exports = BTH;
