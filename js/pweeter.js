(function() {
    class Pweeter extends EventEmitter {
        constructor() {
            super();

            this.last = null;
            this.init();
        }

        init() {
            this.username = localStorage.getItem('username') || '';
            this.userimage = localStorage.getItem('userimage') || '';
            this.keys = localStorage.getItem('keys') || '';

            try {
                if(this.keys) {
                    this.keys = JSON.parse(this.keys);
                    this.address = this.keys.public;
                }
            }
            catch (e) {
                console.log(e);
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
                console.log('Bad Key Pair');
                return;
            }

            this.emit('send');

            // if accessing from a file:  do not use worker
            if (location.protocol.indexOf('file') > -1) {
                const c = new Compute(msg, async () => {
                    msg.sign(this.keys.private);
                    await this.sendMessageToNode(msg);
                });
                c.solve(10); //a little longer wait time per try
                return;
            }

            const worker = new Worker('/js/worker.js');
            worker.onmessage = async (d) => {
                msg = new Message(d.data);
                msg.sign(this.keys.private);
                await this.sendMessageToNode(msg);
            };
            worker.postMessage(msg);
        }

        async sendMessageToNode(msg) {
            if(!msg.isValid()) {
                //show error
                console.log('message invalid');
                this.emit('sendFailed');
                this.emit('sendComplete');
                return;
            }

            let valid = 'BAD';
            let tries = 0;
            await this.initNodes();
            while(valid !== 'OK' && tries++ < 5) {
                try {
                    valid = await Request.post(`${this.randomNode()}/message`, msg);
                }
                catch (e) {
                    valid = 'BAD';
                    console.log(e);
                }
            }

            if (tries >= 5 && valid === 'BAD') {
                console.log('message denied');
                this.emit('sendFailed');
            }
            
            this.emit('sendComplete');
        }

        async replies(id, page) {
            await this.initNodes();
            let msgs = null;
            let tries = 0;

            while(msgs === null && tries++ < 5) {
                try {
                    msgs = await Request.get(`${this.randomNode()}/search/replies/${id}/page/${page}`);
                }
                catch (e) {
                    msgs = null;
                    console.log(e);
                }
            }

            msgs = msgs || [];
            msgs.forEach(m => m.Pweeter = this);
            return msgs;
        }

        async getMessage(id) {
            await this.initNodes();
            let msg = null;
            let tries = 0;

            while (msg === null && tries++ < 5) 
            {
                try {
                    msg = await Request.get(`${this.randomNode()}/message/${id}`);
                    msg = msg || {};
                    msg.Pweeter = this;
                }
                catch (e) {
                    console.log(e);
                    msg = null;
                }
            }

            return msg;
        }

        async search(text, page) {
            await this.initNodes();
            let msgs = null;
            let tries = 0;

            if(text[0] === '#') {
                text = text.substring(1);
                while (msgs === null && tries++ < 5) 
                {
                    try {
                        msgs = await Request.get(`${this.randomNode()}/search/tag/${text}/page/${page}`);
                    }
                    catch (e) {
                        console.log(e);
                        msgs = null;
                    }
                }
            }
            else {
                while (msgs === null && tries++ < 5) 
                {
                    try {
                        msgs = await Request.get(`${this.randomNode()}/search/address/${text}/page/${page}`);
                    }
                    catch (e) {
                        console.log(e);
                        msgs = null;
                    }
                }
            }

            msgs = msgs || [];
            msgs.forEach(m => m.Pweeter = this);
            return msgs;
        }

        async latest() {
            await this.initNodes();

            this.last = null;
            let tries = 0;

            while(this.last === null && tries++ < 5)
            {
                try {
                    this.last = await Request.get(`${this.randomNode()}/last`);
                }
                catch (e) {
                    console.log(e);
                    this.last = null;
                }
            }

            this.last = this.last || {messages: []};
            this.last.messages = this.last.messages || [];
            this.last.messages.forEach(m => m.Pweeter = this);

            return this.last.messages;
        }

        genKeys() {
            this.keys = Hasher.keypair();
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