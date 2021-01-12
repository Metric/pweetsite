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
        this.observe({errorMessage: null});
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

                //verify keys match
                try {
                    const signTest = Hasher.sign(this.username, this.privkeyInput.value);
                    if (!Hasher.verify(this.username, signTest, this.pubkeyInput.value)) {
                        this.errorMessage = 'Bad Key Pair';
                        return;
                    }
                    else {
                        this.errorMessage = null;
                    }
                }
                catch (e) {
                    this.errorMessage = 'Bad Key Pair';
                    return;
                }

                this.Pweeter.keys = {
                    public: this.pubkeyInput.value,
                    private: this.privkeyInput.value
                };
            }
            else {
                this.Pweeter.genKeys();
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

        return h('div', {class: 'd-flex flex-fill mobile-column'},
                    h('div', {class:'d-flex flex-column justify-content-center align-items-center flex-fill', style: 'padding: 2rem;'},
                        h('div', {class: 'pweet-icon-circle'},
                            h('img', {src: 'images/icon.png'})
                        ),
                        h('div', {class:'pweet-info'},
                            h('h1', {}, 'Become Part of Decentralized Microblogging'),
                            h('h5', {}, `No Deletions, No Blocking, No Censoring, No Editing, No IP Tracking`),
                            h('h6', {}, 'No Single Entity Control, Always Permanent, MIT Opensource'),
                            h('div', {class: 'pweet-info', style:'margin-top: 5%;'}, 
                                h('h2', {}, 'Host a Node or Use UI Anywhere'),
                                h('p', {},
                                    h('a', {href:"https://github.com/Metric/pweet", class: 'btn btn-primary p-2 m-2 w-25'}, 'Node Source'),
                                    h('a', {href:"https://github.com/Metric/pweetsite", class: 'btn btn-secondary p-2 m-2 w-25'}, 'UI Source')
                                ),
                            )
                        ),
                    ),
                    h('div', {class:'flex-fill d-flex justify-content-center bg-light', style: 'padding: 2rem;'}, 
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
                                h('div', {class: 'w-100', style:'color: red; font-size: 12pt;'}, this.errorMessage ? this.errorMessage : ''),
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