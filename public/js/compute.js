'use strict';

importScripts('striptags.js');
importScripts('uuid.js');
importScripts('nacl-fast.min.js');
importScripts('hasher.js');
importScripts('cuckoo-cycle.js');
importScripts('message.js');

class Compute {
    constructor(message, cb) {
        this.svx = new Solver('placeholder', MDIFF);
        this.mtx = new SimpleMiner(this.svx);
        this.cb = cb;
        this.message = message;
    }

    solve() {
        setTimeout(() => {
            this.run();
        }, 1000);
    }

    run() {
        this.svx.updateKey(this.message.hash);

        const sol = this.mtx.run();
        if(sol) {
            this.message.solution = Array.prototype.slice.call(sol, 0);
            this.cb();
            return;
        }

        this.message.nonce++;
        setTimeout(() => {
            this.run();
        }, 1);
    }
}

onmessage = (d) => {
    const msg = new Message(d.data);
    const c = new Compute(msg, () => {
        postMessage(msg);
    });
    c.solve();
};