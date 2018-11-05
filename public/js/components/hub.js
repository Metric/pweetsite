'use strict';

class Hub extends Component {
    constructor(o, parent) {
        super(o, parent);
        this.observe({alert: ''});
        this.prevList = LiveView;
        this.onHandleSubmit = this.onHandleSubmit.bind(this);
        this.onHashChange = this.onHashChange.bind(this);

        this.Pweeter.on('send', () => {
            this.alert = 'Sending message, this may take a bit...'
        });
        this.Pweeter.on('sendComplete', () => {
            this.alert = '';
        });
    }

    onHashChange() {
        console.log('hash changed: ' + location.hash);
        this.forceUpdate();
    }

    componentDidMount() {
        console.log('hub component mounted');
        window.addEventListener('hashchange', this.onHashChange, false);
    }


    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChange, false);
    }

    onHandleSubmit() {
        location.hash = '#/discover';
        this.forceUpdate();
    }

    render() {
        console.log(`username: ${this.Pweeter.username}`);
        if(!this.Pweeter.username || this.Pweeter.username.length === 0 || this.Pweeter.username === 'null') {
            return h(SetupView, {Pweeter: this.Pweeter, onHandleSubmit: this.onHandleSubmit});
        }
        else {
            let listView = null;
            if(location.hash.startsWith('#/user') || location.hash.startsWith('#/tag') || location.hash.startsWith('#/post')) {
                listView = SearchView;
            }
            else if(location.hash.startsWith('#/discover')) {
                listView = LiveView;
            }
            else if(location.hash.startsWith('#/account')) {
                listView = AccountView;
            }
            else if(location.hash.startsWith('#/signout')) {
                this.Pweeter.username = '';
                this.Pweeter.userimage = '';
                this.Pweeter.keys = '';
                this.Pweeter.save();

                return h(SetupView, {Pweeter: this.Pweeter, onHandleSubmit: this.onHandleSubmit});
            }
            else {
                listView = this.prevList;
            }

            this.prevList = listView;

            return h('div', {class:'flex-fill d-flex flex-column'},
                        h(Navigation, {Pweeter: this.Pweeter, path: location.hash}),
                        h('div', {class:'w-100 flex-fill'},
                            h(listView, {Pweeter: this.Pweeter})
                        ),
                        h('div', {class:'snackbar text-white', style: {
                            display: this.alert && this.alert.length > 0 ? 'block' : 'none'
                        }}, 
                            h('div', {class: 'snackbar-content'}, this.alert)
                        )
                    );
        }
    }
}