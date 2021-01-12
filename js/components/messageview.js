'use strict';

class MessageView extends Component {
    constructor(o, parent) {
        super(o,parent);
        this.onRepliesClick = this.onRepliesClick.bind(this);
        this.onEmbedClick = this.onEmbedClick.bind(this);
        this.onMoreRepliesClick = this.onMoreRepliesClick.bind(this);
        this.onReplyClick = this.onReplyClick.bind(this);
        this.content = null;
        this.repliesView = null;
        this.hasNext = false;
        this.page = 1;
        this.seen = {};
        this.observe({replies: [], showEmbed: false, replyToEmbed: null, showReplies: false, showReply: false});
    }

    onReplyClick(e) {
        e.stopPropagation();
        e.preventDefault();

        this.showReply = !this.showReply;
    }

    sortMessages(p1, p2) {
        return p2.date - p1.date;
    }

    onReply(msg, list) {
        if(!this.seen[msg.id]) {
            this.seen[msg.id] = true;
            msg.replyTo = null; //prevent duplicate reply quote embed
            list = list.concat([msg]).sort(this.sortMessages);
        }

        return list;
    }

    async onMoreRepliesClick(e) {
        e.stopPropagation();
        e.preventDefault();

        if (!this.id || !this.Pweeter) {
            return;
        }

        try {
            let real = this.replies;
            const next = await this.Pweeter.replies(this.id, this.page++);
            this.hasNext = next.length > 0;

            if(this.hasNext) {
                next.forEach(m => real = this.onReply(m, real));
                this.replies = real;
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    async initReplies() {
        if(this.replies.length === 0 && this.id && this.Pweeter) {
            try {
                let all = this.replies;
                const real = await this.Pweeter.replies(this.id, this.page++);
                this.hasNext = real.length > 0; 

                if(this.hasNext) {
                    real.forEach(m => all = this.onReply(m, all));
                    this.replies = all;
                }
                else {
                    this.forceUpdate();
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        if (this.replyTo && !this.replyToEmbed && this.id && this.Pweeter) {
            const msg = await this.Pweeter.getMessage(this.replyTo);
            if (msg) {
                msg.isQuoted = true;
                this.replyToEmbed = h(MessageView, msg);
            }
        }
    }

    onEmbedClick(e) {
        e.stopPropagation();
        e.preventDefault();

        this.showEmbed = !this.showEmbed;
        console.log('show embed toggle');
    }

    onRepliesClick(e) {
        e.stopPropagation();
        e.preventDefault();

        this.showReplies = !this.showReplies;
    }

    createBodyContent(message) {
        if (!message) {
            return [];
        }

        const items = message.split(/\s/);
        let buffer = [];
        const elements = [];
        items.forEach(i => {
            if(i.match(Utils.HASH_MATCH)) {
                if(buffer.length > 0) {
                    const m = buffer.join(' ');
                    elements.push(h('span', {}, m));
                }
                buffer = [];
                elements.push(h('a', {href:`#/tag/${i.substring(1)}`}, ' ' + i + ' '));
            }
            else if(i.match(Utils.MENTION_MATCH)) {
                if(buffer.length > 0) {
                    const m = buffer.join(' ');
                    elements.push(h('span', {}, m));
                }
                buffer = [];
                elements.push(h('a', {href:`#/user/${i.substring(1)}`}, ' ' + i + ' '));
            }
            else if(i.match(Utils.SIMPLE_URL_MATCH)) {
                if(buffer.length > 0) {
                    const m = buffer.join(' ');
                    elements.push(h('span', {}, m));
                }
                buffer = [];
                const low = i.toLowerCase();
                if(low.endsWith('.jpeg') || low.endsWith('.jpg')
                    || low.endsWith('.gif') || low.endsWith('.png')
                    || low.endsWith('.webp')) {
                        elements.push(h('img', {src: i}));
                    }
                    else {
                        elements.push(h('a', {target:'_blank', href:i},' ' + i + ' '));
                    }
            }
            else {
                buffer.push(i);
            }
        });
        if(buffer.length > 0) {
            const m = buffer.join(' ');
            elements.push(h('span', {}, m));
        }
        return elements;
    }

    dateFormat(date, format) {
        if (!date) {
            return 'Unknown';
        }

        const now = Date.now();
        const diff = now - date;
        let unit = '', num = 0;

        const second = 1e3, minute = 6e4,hour = 36e5,day = 864e5,week = 6048e5;

        const formats = {
            seconds: {
                short: 's',
                long: ' sec'
            },
            minutes: {
                short: 'm',
                long: ' min'
            },
            hours: {
                short: 'h',
                long: ' hr'
            },
            days: {
                short: 'd',
                long: ' day'
            }
        }

        if(diff < minute) {
            unit = 'seconds';
            num = Math.round(diff / second);
        }
        else if(diff < hour) {
            unit = 'minutes';
            num = Math.round(diff / minute);
        }
        else if(diff < day) {
            unit = 'hours';
            num = Math.round(diff / hour);
        }
        else if(diff < week) {
            unit = 'days';
            num = Math.round(diff / day);
        }
        else {
            return new Date(date).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        }

        return num + formats[unit][format];
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.content) {
                this.content.classList.add('fade-active');
            }
            this.initReplies();
        }, Math.random() * 250 + 125);
    }

    reset() {
        this.disabled = true;
        this.replyToEmbed = null;
        this.replies = [];
        this.page = 1;
        this.hasNext = false;
        this.seen = {};
        this.showReplies = false;
        this.showReply = false;
        this.disabled = false;
    }

    componentDidUpdate() {
        if(this.content) {
            this.content.classList.remove('fade-active');

            this.reset();

            setTimeout(() => {
                if (this.content) {
                    this.content.classList.add('fade-active');
                }
                this.initReplies();
            }, Math.random() * 250 + 125);
        }
    }

    render() {
        const items = [];

        for(let i = 0; i < this.replies.length; i++) {
            items.push(h(MessageView, this.replies[i]));
        }

        let cmicon = 'far fa-comment';

        if(this.showReplies) {
            cmicon = 'fas fa-minus';
        }

        let displayReplies = 'display: none;';
        if(this.showReplies) {
            displayReplies = 'display: block;';
        }

        let displayMoreReplies = 'display: none;';
        if(this.hasNext && this.showReplies) {
            displayMoreReplies = 'display: block;';
        }

        const blankUserIcon = h('i', {class: 'fas fa-user text-muted', style:'font-size: 46pt;'});
        const userIcon = h('img', {src:this.image});

        const replyHandler = () => {
            console.log('reply handler called');
            this.showReply = false;
        };

        const replyCompose = this.showReply && this.Pweeter && this.Pweeter.keys && this.id ? 
                            h(ComposeView, {compose: false, Pweeter: this.Pweeter, replyTo: this.id, oncancel: replyHandler, onsubmit: replyHandler}) 
                            : null;

        const replyButton =  this.Pweeter && this.Pweeter.keys && this.id ? 
                            h('div', {onclick: this.onReplyClick},
                                h('i', {class:'fas fa-reply',title:'Reply'})
                            ) 
                            : null;

        const replyToEmbed = this.replyToEmbed;

        const embedCode = this.id ? `<iframe src="https://www.pweeter.com/#/embed/${this.id}" height="${replyToEmbed ? '512' : '256'}" width="512"></iframe>` : '';
        const embedArea = this.showEmbed ? h('div', {class: 'pweet-embed'},
                                                h('textarea', {class: 'w-100', onclick: (e) => {
                                                    e.target.select();
                                                    e.target.setSelectionRange(0, 99999);
                                                }}, embedCode)
                                            )
                                            : null;

        return h('div', {ref: f => this.content = f, style:'max-width: 512px;', class:'pweet relative ml-auto mr-auto' + 
                        (this.isQuoted ? ' pweet-quote-embed' : '') + (this.isEmbedded ? ' pweet-embedded' : '')}, 
                        h('div', {class:'pweet-header word-wrap-break'},
                            h('div', {class:'w-100 d-flex align-items-center'},
                                this.image ? userIcon : blankUserIcon, //h('img', {src: this.image}),
                                h('div', {class: 'd-flex justify-content-center word-wrap-break flex-column'},
                                    h('span', {class:'pweet-username'}, (this.name || '')),    
                                    h('a', {class:'pweet-address txt-primary', href:`#/user/${this.address || ''}`}, '@' + (this.address || ''))
                                )
                            ),
                        ),
                        replyToEmbed,
                        h('div', {class:'pweet-message word-wrap-break'}, this.createBodyContent(this.message)),
                        h('div', {class:'pweet-date text-secondary'}, this.dateFormat(this.date, 'short')),
                        h('div', {class:'d-flex flex-row pweet-options'},
                            h('div', {class: 'd-flex justify-content-center align-items-center', onclick: this.onRepliesClick},
                                h('i', {class:cmicon,title:'Replies'}),
                                this.replies.length && !this.showReplies ? h('span', {style: 'font-size: 12pt; padding: 0px 0px 0px 5px;'}, this.replies.length) : null, 
                            ),
                            replyButton,
                            h('div', {onclick: this.onEmbedClick},
                                h('i', {class: 'fas fa-code', title:'Embed'})
                            )
                        ),
                        embedArea,
                        replyCompose,
                        h('div', {ref: f => this.repliesView = f, class:'w-100 pweet-replies', style:displayReplies}, items),
                        h('button', {class: 'w-100 btn text-primary', onclick:this.onMoreRepliesClick, style:displayMoreReplies})
                    );
    }
}

class MessageEmbed extends Component {
    constructor(o, parent) {
        super(o, parent);
        this.observe({message: null});
    }

    async load() {
        if(!this.id) {
            console.log('invalid id for embed');
            return;
        }

        const msg = await this.Pweeter.getMessage(this.id);
        msg.isEmbedded = true;
        this.message = msg;

        document.body.classList.add('body-embedded');
        document.documentElement.classList.add('body-embedded');
    }

    componentDidMount() {
        this.load();
    }

    render() {
        return h(MessageView, this.message);
    }
}

class MessageList extends Component {
    constructor(o, parent) {
        super(o, parent);
        this.scrollArea = null;
        this.onScroll = this.onScroll.bind(this);
    }

    onScroll() {
        if(this.scrollArea.scrollTop >= this.scrollArea.scrollHeight - Utils.MAX_LENGTH) {
            if (this.handleInfiniteScroll) {
                this.handleInfiniteScroll();
            }
        } 
    }

    render() {
        if (this.messages.length === 0) {
            return h('div', {class:'fixed-center text-center'}, 
                        h('h2', {class:'text-muted p-2 w-100'}, 'Where did all the pweets go?')
                    );
        }

        const items = [];
        for(let i = 0; i < this.messages.length; i++) {
            items.push(h(MessageView, this.messages[i]));
        }
        return h('div', {ref: f => this.scrollArea = f, class:'first-div flex-fill w-100 overflow-y-visible', onscroll: this.onScroll}, 
            items
        );
    }
}