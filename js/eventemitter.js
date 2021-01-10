'use strict';

class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    remove(event, cb) {
        if(cb && event) {
            const l = this.listeners[event];

            if(l) {
                const i = l.findIndex(c => c.fn === cb);

                if(i > -1) {
                    l.splice(i,1);
                }
            }
        }
        else if(event) {
            delete this.listeners[event];
        }

        return this;
    }

    on(event, cb) {
        let list = this.listeners[event] || [];

        const l = {type: 0, fn: cb};
        list.push(l);

        this.listeners[event] = list;

        return this;
    }

    once(event, cb) {
        let list = this.listeners[event] || [];
        
        const l = {type: 1, fn: cb};
        list.push(l);

        this.listeners[event] = list;

        return this;
    }

    emit(event, ...args) {
        const list = this.listeners[event];

        if(list) {
            for(let i = 0; i < list.length; i++) {
                const ln = list[i];
                if(ln.type === 1) {
                    list.splice(i,1);
                    i--;
                }
                ln.fn.apply(this, args);
            }
        }

        return this;
    }
}