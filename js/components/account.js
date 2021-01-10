'use strict';

class AccountView extends Component {
    constructor(o, parent) {
        super(o, parent);

        this.userimage = this.Pweeter.userimage;
        this.username = this.Pweeter.username;
        this.pubkey = this.Pweeter.keys.public;
        this.privkey = this.Pweeter.keys.private;

        this.usernameInput = null;
        this.imageInput = null;

        this.onInput = this.onInput.bind(this);
    }

    onInput(e) {
        if(e.target === this.usernameInput) {
            if(e.target.value && Utils.isValidName(e.target.value)) {
                this.username = e.target.value;
                this.Pweeter.username = this.username;
                this.Pweeter.save();
            }
        }
        else if(e.target === this.imageInput) {
            this.tryAndApplyIcon(e.target.value);
        }
    }

    async tryAndApplyIcon(url) {
        try {
            await Utils.testImageUrl(url);
            this.userimage = url;
            this.Pweeter.userimage = url;
            this.Pweeter.save();
            this.forceUpdate();
        }
        catch (e) {
            if(e) {
                console.log(e);
            }
            this.userimage = null;
        }
    }

    render() {
        const blankUserIcon = h('p', {class:'text-center'}, 
                                    h('i', {class: 'fas fa-user text-muted', style:'font-size: 100pt;'})
                                );
        const userIcon = h('p', {class:'text-center'}, 
                                h('img', {src:this.userimage, width:'256', style:'border-radius: 100%;'})
                            );

        return h('div', {class: 'w-100'},
                    h('div', {class:'w-100 d-flex align-items-center justify-content-center bg-light p-2'}, 
                        h('form', {ref: f => this.form = f, class:'max-width-512 d-flex flex-column mt-100', id:'accountForm', novalidate:'true'},
                            h('div', {class:'form-group max-width-512'},
                                this.userimage ? userIcon : blankUserIcon,
                                h('label', {class: 'text-left text-muted w-100'}, 'Image URL'),
                                h('input', {class:'form-control', type:'text', required:'true', value:this.userimage, pattern:'[\\S]+:\\/\\/[\\S]+',
                                    ref: f => this.imageInput = f, placeholder:'image url', oninput:this.onInput}),
                                h('small', {class: 'text-muted'}, 'Changing this will not change your icon on previous messages')
                            ),
                            h('div', {class:'form-group max-width-512'},
                                h('label', {class:'text-muted w-100'}, 'Username'),
                                h('input', {class:'form-control', type:'text', required:'true', value:this.username, pattern:'[A-Za-z0-9_]{1,15}', 
                                    ref: f => this.usernameInput = f, placeholder:'username', oninput:this.onInput}),
                                h('p', {class:'invalid text-danger ml-1 mt-1'}, 'Invalid username'),
                                h('small', {class: 'text-muted'}, 'Changing this will not change your username on previous messages')
                            ),
                            h('div', {class:'form-group max-width-512'},
                                h('label', {class:'text muted w-100'}, 'Public Key (you can share this with others)'),
                                h('p', {class: 'mt-1 bg-primary text-white p-4 word-break'}, this.pubkey),
                                h('small', {class: 'text-muted'}, 'Please back this up with your private key somewhere safe! You will need this and your private key if you want to continue to use the same account.')
                            ),
                            h('div', {class:'form-group max-width-512'},
                                h('label', {class:'text text-danger w-100'}, 'Private Key (do not share this with others!)'),
                                h('p', {class: 'mt-1 bg-danger text-white p-4 word-break'}, this.privkey),
                                h('small', {class: 'text-muted'}, 'Once someone knows your private key, you are screwed!')
                            ),
                            h('div', {class:'form-group max-width-512 text-center'},
                                h('a', {class:'p-2 display-block w-100', href:'#/signout'}, 'Sign out'),
                                h('small', {class: 'display-block text-muted'}, 'Signing out will remove your keys from local storage.'),
                                h('small', {class: 'display-block text-muted'}, 'Be sure your keys are backed up first!')
                            )
                        )
                    )
                );
    }
}