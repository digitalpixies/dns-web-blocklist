'use strict';

const request = require('request');
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
        request(url, {
            timeout: 3000
        }, (error, response, body) => {
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
                //console.log(line);
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
        });
    });
}

request(url, {
    timeout: 3000
}, (error, response, body) => {
    if (!error) {
        const $ = cheerio.load(body);
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
    }
});