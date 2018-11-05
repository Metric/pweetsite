'use strict';

class SetupView extends Component {
    constructor(o,parent) {
        super(o,parent);
        this.form = null;

        this.onInput = this.onInput.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.usernameInput = null;
        this.imageInput = null;
        this.pubkeyInput = null;
        this.privkeyInput = null;
    }

    componentDidMount() {
       /* if(!this.dragDrop) {
            this.dragDrop = new DragDrop(['png','jpg','jpeg','gif','webp'], document.getElementById('main'), true);
            this.dragDrop.on('data', (d) => {this.userimage = d; this.forceUpdate(); });
        }*/
    }

    componentWillUnmount() {
        /*if(this.dragDrop) {
            this.dragDrop.dispose();
        }*/
    }

    onKeyPress(e) {
        if(e.key === 'Enter') {
            this.onSubmit(e);
        }
    }

    onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        if(this.form && this.form.checkValidity() && this.username && this.userimage) {
            this.Pweeter.username = this.username;
            this.Pweeter.userimage = this.userimage;
            
            if(this.pubkeyInput.value && this.pubkeyInput.value.length > 0 
                && this.privkeyInput.value && this.privkeyInput.value.length > 0) {

                this.Pweeter.keys = {
                    public: this.pubkeyInput.value,
                    private: this.privkeyInput.value
                };
            }

            this.Pweeter.save();

            if(this.onHandleSubmit) {
                this.onHandleSubmit();
            }
        }
    }

    async onInput(e) {
        if(e.target === this.usernameInput) {
            if(e.target.value && Utils.isValidName(e.target.value)) {
                this.username = e.target.value;
            }
        }
        else if(e.target === this.imageInput) {
            try {
                await Utils.testImageUrl(e.target.value);
                this.userimage = e.target.value;
                this.forceUpdate();
            }
            catch (e) {
                this.userimage = null;
                this.forceUpdate();
            }
        }
    }

    render() {
        const blankUserIcon = h('p', {}, 
                                    h('i', {class: 'fas fa-user text-muted', style:'font-size: 46pt;'})
                                );
        const userIcon = h('p', {}, 
                                h('img', {src:this.userimage, width:'64', style:'border-radius: 100%;'})
                            );

        return h('div', {class: 'd-flex flex-fill'},
                    h('div', {class:'flex-fill'}),
                    h('div', {class:'flex-fill d-flex justify-content-center bg-light p-2'}, 
                        h('form', {ref: f => this.form = f, class:'min-width-256 d-flex flex-column align-self-center', id:'setupForm', novalidate:'true'},
                            h('div', {class:'form-group text-center'},
                                this.userimage ? userIcon : blankUserIcon,
                                h('small', {class:'text-muted'}, 'enter an image url to set as icon'),
                                h('input', {class:'form-control', type:'text', required:'true', value:this.userimage, pattern:'[\\S]+:\\/\\/[\\S]+',
                                    ref: f => this.imageInput = f, placeholder:'image url', oninput:this.onInput})
                            ),
                            h('div', {class:'form-group'},
                                h('label', {class:'text-muted w-100'}, 'Username'),
                                h('input', {class:'form-control', type:'text', required:'true', value:this.username, pattern:'[A-Za-z0-9_]{1,15}', 
                                    ref: f => this.usernameInput = f, placeholder:'username', onkeydown:this.onKeyPress, oninput:this.onInput}),
                                h('p', {class:'invalid text-danger ml-1 mt-1'}, 'Invalid username'),
                            ),
                            h('div', {class:'form-group'},
                                h('label', {class:'text-muted w-100'}, 'Public Key'),
                                h('input', {class:'form-control', type:'text', ref: f => this.pubkeyInput = f, placeholder:'public key'}),
                                h('label', {class:'text-muted w-100'}, 'Private Key'),
                                h('input', {class:'form-control', type:'text', ref: f => this.privkeyInput = f, placeholder:'private key'}),
                                h('small', {class:'text-muted'}, 'If you do not provide a key pair, one will automatically be generated')
                            ),
                            h('div', {class:'form-group'},
                                h('button', {class:'btn btn-primary mt-4 w-100', onclick:this.onSubmit}, 'LET\'S GO!')
                            )
                        )
                    )
                );
    }
}