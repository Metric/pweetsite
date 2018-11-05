'use strict';

const Utils = {
    MAX_LENGTH: 140,
    HASH_MATCH: /\#[A-Za-z0-9_-]/gi,
    MENTION_MATCH: /\@[A-Za-z0-9]/gi,
    NAME_MATCH: /[A-Za-z0-9_]{1,15}/gi,
    SIMPLE_URL_MATCH: /[\S]+:\/\/[\S]+/gi,
    MAX_USERNAME_LENGTH: 15,
    isValidName: (name) => {
        return name.match(Utils.NAME_MATCH) && name.length > 0 && name.length < Utils.MAX_USERNAME_LENGTH;
    },
    getHashes: (message) => {
        const hashes = [];
        const items = message.split(/\s/);
        items.forEach(i => {
            if(i.match(Utils.HASH_MATCH)) {
                hashes.push(i);
            }
        });  
        return hashes;
    },
    getMentions: (message) => {
        const mentions = [];
        const items = message.split(/\s/);
        items.forEach(i => {
            if(i.match(Utils.MENTION_MATCH)) {
                mentions.push(i);
            }
        });
        return mentions;
    },
    getLength: (message) => {
        if(message.length === 0) return Utils.MAX_LENGTH + 1;
        const hashes = Utils.getHashes(message);
        hashes.forEach(h => {
            message = message.replace(h, '');
        });
        const mentions = Utils.getMentions(message);
        mentions.forEach(m => {
            message = message.replace(m, '');
        });
    
        return message.length;
    },
    getURLs: (message) => {
        return message.match(Utils.SIMPLE_URL_MATCH);
    },
    isExcessive: (message) => {
        if (Utils.getMentions(message).length > 10 || Utils.getHashes(message).length > 10) {
            return true;
        }

        return false;
    },
    testImageUrl: function (url, timeout) {
        return new Promise(function (res, rej) {
            timeout = timeout || 5000;
            let timer = null, img = new Image();
            img.onerror = img.onabort = () => {
                clearTimeout(timer);
                rej();
            };
            img.onload = () => {
                clearTimeout(timer);
                res();
            };
            timer = setTimeout(() => {
                img.src = '//!!!!!/test.jpg';
                rej();
            }, timeout);
            img.src = url;
        });
    }
};