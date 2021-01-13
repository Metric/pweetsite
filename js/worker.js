'use strict';

importScripts('striptags.js');
importScripts('uuid.js');
importScripts('nacl-fast.min.js');
importScripts('hasher.js');
importScripts('cuckoo-cycle64.js');
importScripts('message.js');
importScripts('compute.js');

onmessage = (d) => {
    const msg = new Message(d.data);
    const c = new Compute(msg, () => {
        postMessage(msg);
    });
    c.solve();
};