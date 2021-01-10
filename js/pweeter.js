(function() {
    class Pweeter extends EventEmitter {
        constructor() {
            super();

            this.last = null;
            this.init();
        }

        init() {
            this.username = localStorage.getItem('username') || null;
            this.userimage = localStorage.getItem('userimage') || null;
            this.keys = localStorage.getItem('keys') || null;

            if(this.keys) {
                this.keys = JSON.parse(this.keys);
                this.address = this.keys.public;
            }
            else {
                this.keys = Hasher.keypair();
                this.address = this.keys.public;
                this.save();
            }
        }

        async initNodes() {
            if (this.nodes) {
                return;
            } 

            this.nodes = JSON.parse(await Request.get('https://raw.githubusercontent.com/Metric/pweet/master/peers.json')) || [];

            //for testing insert local
            this.nodes.push('http://127.0.0.1:8000/');
        }

        randomNode() {
            let i = 0;
            i = Math.round(Math.random() * (this.nodes.length - 1));
            return this.nodes[i].replace(/\/$/, '');
        }

        send(message, replyTo) {
            let msg = new Message({
                address: this.keys.public,
                message: message,
                image: this.userimage,
                name: this.username,
                replyTo: replyTo || ''
            });

            //validate public and private keys work together
            const signTest = Hasher.sign(this.username, this.keys.private);
            if (!Hasher.verify(this.username, signTest, this.keys.public)) {
                console.log('public private key mismatch');
                return;
            }

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
                    await this.initNodes();
                    const valid = await Request.post(`${this.randomNode()}/message`, msg);
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
            await this.initNodes();
            const msgs = await Request.get(`${this.randomNode()}/search/replies/${id}/page/${page}`);
            msgs.forEach(m => m.Pweeter = this);
            return msgs;
        }

        async search(text, page) {
            await this.initNodes();
            if(text[0] === '#') {
                text = text.substring(1);
                const msgs = await Request.get(`${this.randomNode()}/search/tag/${text}/page/${page}`);
                msgs.forEach(m => m.Pweeter = this);
                return msgs;
            }
            else {
                const msgs = await Request.get(`${this.randomNode()}/search/address/${text}/page/${page}`);
                msgs.forEach(m => m.Pweeter = this);
                return msgs;
            }
        }

        latest() {
            return new Promise(async (res, rej) => {
                try {
                    await this.initNodes();

                    this.last = await Request.get(`${this.randomNode()}/last`);
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
            this.address = this.keys.public;
            localStorage.setItem('username', this.username);
            localStorage.setItem('userimage', this.userimage);
            localStorage.setItem('keys', JSON.stringify(this.keys));
        }
    }

    const pweeter = new Pweeter();
    Readapt.render(h(Hub, {Pweeter: pweeter}), document.getElementById('main'));
})();