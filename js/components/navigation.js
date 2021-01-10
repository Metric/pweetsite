'use strict';

class Navigation extends Component {
    render() {
        let replyTo = '';
        
        if(this.path.startsWith('#/reply')) {
            replyTo = this.path.split('/')[2];
        }

        if(!replyTo) {
            replyTo = '';
        }

        const composeShown = h('li', {class:'nav-item relative'},
                                h('a', {class:'nav-link', href:this.previous},
                                    h('i', {class: 'fas fa-times'})
                                ),
                                h(ComposeView, {Pweeter:this.Pweeter, replyTo: replyTo, compose: true, previous: this.previous})
                            );
        const composeHidden =  h('li', {class:'nav-item relative'},
                                    h('a', {class:'nav-link', href:'#/compose'},
                                        h('i', {class:'fas fa-pen-nib'})
                                    )
                                );

        this.previous = this.path || '#/discover';

        const blankUserIcon = h('i', {class: 'fas fa-user text-muted', style:'font-size: 16pt;'});
        const userIcon = h('img', {src:this.Pweeter.userimage, width: 32, style:'border-radius: 100%;'});

        return h('header', {class:'navbar navbar-shadow navbar-blur navbar-expand-lg navbar-dark bg-dark w-100', style:'z-index: 999; position: fixed; min-height: 60px;'},
                    h('ul', {class:'navbar-nav w-100 d-flex align-items-center justify-content-between'},
                        h('li', {class:this.path.startsWith('#/discover') ? 'nav-item active' : 'nav-item'},
                            h('a', {class:'nav-link', href:'#/discover'}, 'DISCOVER')
                        ),
                        h('li', {class:this.path.startsWith(`#/user/${this.Pweeter.address}`) ? 'nav-item active': 'nav-item'},
                            h('a', {class:'nav-link', href:`#/user/${this.Pweeter.address}`}, 'ME')
                        ),
                        h('li', {class:'nav-item', style: 'width: 50%;'}, 
                            h(SearchBar, {Pweeter:this.Pweeter})
                        ),
                        h('li', {class:this.path.startsWith('#/account') ? 'nav-item active' : 'nav-item'},
                            h('a', {class: 'nav-link', href:'#/account'}, 
                                this.Pweeter.userimage ? userIcon : blankUserIcon,
                                h('span', {class:'ml-2'}, 'ACCOUNT')
                            )
                        ),
                        this.path.startsWith('#/compose') || this.path.startsWith('#/reply') ? composeShown : composeHidden
                    )
                )
    }
}