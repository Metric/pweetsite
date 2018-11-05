(function() {
    class Pweeter extends EventEmitter {
        constructor() {
            super();

            this.last = null;
            this.init();
        }

        init() {
            this.username = localStorage.getItem('username');
            this.userimage = localStorage.getItem('userimage');
            this.keys = localStorage.getItem('keys');

            if(this.keys) {
                this.keys = JSON.parse(this.keys);
            }
            else {
                this.keys = Hasher.keypair();
                this.save();
            }
        }

        send(message, replyTo) {
            let msg = new Message({
                address: this.keys.public,
                message: message,
                image: this.userimage,
                name: this.username,
                replyTo: replyTo || ''
            });

            this.emit('send');

            const worker = new Worker('/js/compute.js');
            worker.onmessage = async (d) => {
                msg = new Message(d.data);
                msg.sign(this.keys.private);

                if(!msg.isValid()) {
                    //show error
                    console.log('message invalid');
                    return;
                }
    
                //send to server
                try {
                    const valid = await Request.post('http://127.0.0.1:8000/message', msg);
                    if(valid !== 'OK') {
                        //show error
                        console.log('message denied');
                    }
                }
                catch (e) {
                    //show error
                    console.log(e);
                }

                this.emit('sendComplete');
            };
            worker.postMessage(msg);
        }

        async replies(id, page) {
            const msgs = await Request.get('http://127.0.0.1:8000/search/replies/' + id + '/page/' + page);
            msgs.forEach(m => m.Pweeter = this);
            return msgs;
        }

        async search(text, page) {
            if(text[0] === '#') {
                text = text.substring(1);
                const msgs = await Request.get('http://127.0.0.1:8000/search/tag/' + text + '/page/' + page);
                msgs.forEach(m => m.Pweeter = this);
                return msgs;
            }
            else {
                const msgs = await Request.get('http://127.0.0.1:8000/search/address/' + text + '/page/' + page);
                msgs.forEach(m => m.Pweeter = this);
                return msgs;
            }
        }

        latest() {
            return new Promise(async (res, rej) => {
                try {
                    this.last = await Request.get('http://127.0.0.1:8000/last');
                    this.last.messages.forEach(m => m.Pweeter = this);

                    res(this.last.messages);
                }
                catch (e) {
                    console.log(e);
                    res([]);
                }
            });
        }

        save() {
            localStorage.setItem('username', this.username);
            localStorage.setItem('userimage', this.userimage);
            localStorage.setItem('keys', JSON.stringify(this.keys));
        }
    }

    const pweeter = new Pweeter();
    Readapt.render(h(Hub, {Pweeter: pweeter}), document.getElementById('main'));
})();