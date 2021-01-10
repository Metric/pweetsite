'use strict';

const MAX_MESSAGES_LOAD = 100000;

class LiveView extends Component {
    constructor(o, parent) {
        super(o, parent);
        this.onMessage = this.onMessage.bind(this);
        this.onNewMessagesClick = this.onNewMessagesClick.bind(this);

        this.observe({messages: []});
        this.seen = {};
        this.updateTimer = null;
        this.newMessages = [];
        this.messageAlertArea = null;
    }

    sortMessages(p1,p2) {
        return p2.date - p1.date;
    }

    onMessage(msg, list) {
        if(!this.seen[msg.id]) {
            this.seen[msg.id] = true;
            const sorted = [msg].concat(list).sort(this.sortMessages);

            if(sorted.length > MAX_MESSAGES_LOAD) {
                list = sorted.slice(0, MAX_MESSAGES_LOAD - 100);
            }
            else {
                list = sorted;
            }
        }

        return list;
    }

    async getLatest() {
        let real = this.newMessages;
        const items = await this.Pweeter.latest();
        items.forEach(m => real = this.onMessage(m, real));
        this.newMessages = real;

        //show initial bunch
        if (this.messages.length === 0) {
            const m = this.newMessages;
            this.newMessages = [];
            this.messages = m;
        }

        if(this.newMessages.length > 0) {
            this.messageAlertArea.querySelector('p').textContent = 'New Messages: ' + this.newMessages.length;
            this.messageAlertArea.style.display = 'block';
        }

        this.updateTimer = setTimeout(() => {
            this.getLatest();
        }, 5000);
    }

    componentDidMount() {
        console.log('live view mounted');
        this.seen = {};
        this.getLatest();
    }

    componentWillUnmount() {
        if(this.updateTimer) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
    }

    onNewMessagesClick(e) {
        e.stopPropagation();
        e.preventDefault();

        if(this.newMessages.length > 0) {
            const m = this.newMessages;
            this.newMessages = [];
            this.messageAlertArea.style.display = 'none';
            this.messages = m.concat(this.messages);
        }
    }

    render() {
        return h('section',{class:'w-100 flex-fill d-flex flex-column first-margin'},
                    h('div', {ref: f => this.messageAlertArea = f, 
                        class:'first-div d-flex align-items-center justify-content-between bg-primary navbar-shadow min-width-512 mr-auto ml-auto p-2 mt-1 mb-1', style:'display: none;'},
                        h('p', {class:'text-white display-block', style:'margin: 0px;'}, 'New Messages: ' + this.newMessages.length),
                        h('button', {class:'btn text-primary', onclick:this.onNewMessagesClick}, 'SHOW')
                    ),
                    h(MessageList, {messages: this.messages})
                );
    }
}