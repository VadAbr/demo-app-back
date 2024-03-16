const express = require('express');
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");


const disabledSearch='&label=accept_handicapped'

const urls = {
    'russia': 'https://hh.ru/search/vacancy?L_save_area=true&text=&excluded_text=&area=113&salary=&currency_code=RUR&experience=doesNotMatter&order_by=relevance&search_period=0&items_on_page=50&hhtmFrom=vacancy_search_filter',
    'tuma': 'https://tuma.hh.ru/search/vacancy?L_save_area=true&text=&excluded_text=&area=4487&salary=&currency_code=RUR&experience=doesNotMatter&order_by=relevance&search_period=0&items_on_page=50&hhtmFrom=vacancy_search_filter',
    'spas-klepiki': 'https://spas-klepiki.hh.ru/search/vacancy?L_save_area=true&area=1713&items_on_page=50&hhtmFrom=vacancy_search_filter&search_field=name&search_field=company_name&search_field=description&enable_snippets=false&text='
}

/* GET home page. */
router.get('/jobs', function (req, res, next) {
    let url = urls[req.query.city]
    if (!url) {
        res.send({jobs: []});
        return
    }

    if(req.query.isForDisabled === 'true') {
        url += disabledSearch
    }

    axios
        .get(url, {
            headers: {
                Accept: '*/*'
            }
        })
        .then((response) => {
            const $ = cheerio.load(response.data);
            const foundJobs = $('.serp-item')
            // console.log('foundJobs', foundJobs)

            const preparedJobs = []

            for (let i = 0; i < foundJobs.length; i++) {
                const titleLinkWrapper = $(foundJobs[i]).find('.serp-item__title-link-wrapper')
                const linkWrapper = $(titleLinkWrapper).find('.bloko-link')

                const salaryWrapper = $(foundJobs[i]).find('.bloko-header-section-2')
                const employerWrapper = $(foundJobs[i]).find('a[data-qa=vacancy-serp__vacancy-employer]')
                const experienceWrapper = $(foundJobs[i]).find('div[data-qa=vacancy-serp__vacancy-work-experience]')

                const labelsWrapper = $(foundJobs[i]).find('.labels--CBiQJ5KZ2PKw9wf0Aizk')
                const logoEmployerSrcWrapper = $(foundJobs[i]).find('.vacancy-serp-item-logo')
                const spanWrapper = $(labelsWrapper).find('span')
                // console.log('spanWrapper', spanWrapper)
                const addInfo = []

                // for (let i = 0; i < spanWrapper.length; i++) {
                //   addInfo.push($(spanWrapper[i]))
                // }

                preparedJobs.push({
                    title: $(linkWrapper).text(),
                    url: $(linkWrapper).attr('href'),
                    salary: $(salaryWrapper).text(),
                    employer: $(employerWrapper).text(),
                    experience: $(experienceWrapper).text(),
                    addInfo: addInfo,
                    logoEmployerSrc: $(logoEmployerSrcWrapper).attr('src') || '',
                })
            }

            res.send({jobs: preparedJobs});
        })
        .catch((err) => {
            res.status(err.status || 500);
            res.send();
        });

});

module.exports = router;
