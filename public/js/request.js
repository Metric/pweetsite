'use strict';

class Request {
    static get(url) {
        return new Promise((res, rej) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = () => {
                if(xhr.status === 200) {
                    if(xhr.getResponseHeader('Content-Type').indexOf('json') > -1) {
                        res(JSON.parse(xhr.responseText));
                        return;
                    }

                    res(xhr.responseText);
                    return;
                }
                
                rej();
            };
            xhr.send();
        });
    }

    static post(url, data) {
        return new Promise((res, rej) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);

            if(typeof data === 'object') {
                data = JSON.stringify(data);
            }

            xhr.onload = () => {
                if(xhr.status === 200) {
                    if (xhr.getResponseHeader('Content-Type').indexOf('json') > -1) {
                        res(JSON.parse(xhr.responseText));
                        return;
                    }

                    res(xhr.responseText);
                    return;
                }

                rej();
            }

            xhr.send(data);
        });
    }
}