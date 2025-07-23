'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const url = 'https://raw.githubusercontent.com/WaLLy3K/wally3k.github.io/master/index.html';
const fs = require('fs');

const blacklistToUse = [
    //'other',
    'suspicious',
    'advertising',
    'tracking',
    'malicious'];

const ListToBeMergedIntoBlacklist = (classNames) => {
    for (let className of classNames) {
        for (let blacklistName of blacklistToUse) {
            if (className === blacklistName)
                return true;
        }
    }
    return false;
}

const GetBlacklist = (url, filteredLines) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            timeout: 3000
        })
        .then(response => {
            let body = response.data;
            let lines = body.trim().replace(/\r/g, '\n').replace(/\t/g, ' ').replace(/\ +/g, ' ').split('\n');
            for (let line of lines) {
                if (line.includes('#')) {
                    line = line.split('#')[0];
                }
                if (line === '')
                    continue;
                //skip ipv6 entries
                if (line.includes(':'))
                    continue;
                let parts = line.split(' ');
                if (parts.length === 1)
                    filteredLines[parts[0]] = null;
                else {
                    parts = parts.slice(1);
                    for (let part of parts) {
                        filteredLines[part] = null;
                    }
                }
            }
            resolve();
        })
        .catch(error => {
            reject(error);
        });
    });
}

axios.get(url, {
    timeout: 3000
})
.then(response => {
    const $ = cheerio.load(response.data);
    let blackListEntries = {};
    let blacklistURLs = [];
    let promises = [];
    $('ul.bdUrlList').each((index, dom) => {
        let classNames = $(dom).attr('class').split(' ');
        if (ListToBeMergedIntoBlacklist(classNames)) {
            $(".bdTick", dom).each((index, dom) => {
                let links = $('a', dom);
                blacklistURLs.push($(links[1]).attr('href'));
                promises.push(GetBlacklist($(links[1]).attr('href'), blackListEntries));
            });
        }
    });

    Promise.all(promises).then(() => {
        for (let entry in blackListEntries) {
            console.log(`0.0.0.0 ${entry}`);
        }
    });
})
.catch(error => {
    console.error('Error fetching data:', error);
});
