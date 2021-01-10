'use strict';

class SearchView extends Component {
    constructor(o, parent) {
        super(o, parent);
        this.onMessage = this.onMessage.bind(this);
        this.onHashChange = this.onHashChange.bind(this);
        this.onInfiniteScroll = this.onInfiniteScroll.bind(this);
        this.hasNext = false;
        this.seen = {};
        this.text = '';
        this.page = 1;
        
        this.observe({messages: []});
    }

    sortMessages(p1,p2) {
        return p2.date - p1.date;
    }

    onMessage(msg, list) {
        if(!this.seen[msg.id]
            && (msg.address === this.text || msg.mentions.indexOf('@' + this.text) > -1 
            || msg.tags.indexOf(this.text) > -1)) {
                this.seen[msg.id] = true;
                list = list.concat([msg]).sort(this.sortMessages);
            }

        return list;
    }

    onInfiniteScroll() {
        if (this.hasNext) {
            this.hasNext = false;
            this.more();
        }
    }

    async more() {
        try {
            let real = this.messages;
            const items = await this.Pweeter.search(this.text, this.page++);
            this.hasNext = items.length > 0;
            items.forEach(p => real = this.onMessage(p, real));
            this.messages = real;
        }
        catch (e) {
            console.log(e);
        }
    }

    onHashChange() {
        if(location.hash.startsWith('#/user') || location.hash.startsWith('#/tag')) {
            const path = location.hash.split('/');
            let text = path[path.length - 1];
            if(path[1] === 'tag') {
                if(text[0] !== '#') {
                    text = '#' + text;
                }
            }
            if(path[1] === 'user') {
                if(text[0] === '@') {
                    text = text.substring(1);
                }
            }

            this.text = text;
            this.disabled = true;
            this.messages = [];
            this.page = 1;
            this.seen = {};
            this.disabled = false;
            
            this.more();
        }     
    }

    componentDidMount() {
        this.Pweeter.on('sendComplete', this.onHashChange);
        this.onHashChange();
        window.addEventListener('hashchange', this.onHashChange, false);
    }

    componentWillUnmount() {
        this.Pweeter.remove('sendComplete', this.onHashChange);
        window.removeEventListener('hashchange', this.onHashChange, false);
    }

    render() {
        return h('section', {class:'flex-fill d-flex w-100 first-margin'}, 
                    h(MessageList, {messages: this.messages, handleInfiniteScroll: this.onInfiniteScroll})
                );
    }
}