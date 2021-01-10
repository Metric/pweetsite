'use strict';

class ComposeView extends Component {
    constructor(o, parent) {
        super(o, parent);

        this.onSubmit = this.onSubmit.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.message = '';
        this.observe({messageLength: 0});
        this.textarea = null;
    }

    onInput(e) {
        this.message = e.target.value.replace(/\r|\t|\n/gi, '');
        this.messageLength = Utils.getLength(this.message);
        this.messageLength = this.messageLength > Utils.MAX_LENGTH ? 0 : this.messageLength;
    }

    onKeyPress(e) {
        if (e.key === 'Enter') {
            this.onSubmit(e);
        }
    }

    onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        if(this.messageLength <= Utils.MAX_LENGTH && this.messageLength > 0) {
            //solve message & send
            setTimeout(() => {
                this.Pweeter.send(this.message, this.replyTo || '');
                this.textarea.value = '';
                if (this.compose) {
                    location.hash = this.previous || '#/discover';
                }
                else if (this.onsubmit) {
                    this.onsubmit();
                }
            }, 10);
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.textarea.focus();
        }, 250);
    }

    onCancel(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.compose) {
            location.hash = this.previous || '#/discover';
        }
        else if (this.oncancel) {
            this.oncancel();
        }
    }

    render() {
        return h('div', {class:`${this.compose ? 'pweet-compose min-width-420' : 'pweet-compose-inline'} text-right`}, 
                    h('textarea', {class:'form-control w-100', placeholder:'keep your message short and sweet...', ref: f => this.textarea = f, maxlength:Utils.MAX_LENGTH, value: this.message, oninput:this.onInput, onkeydown:this.onKeyPress}),
                    h('p', {class: this.messageLength > Utils.MAX_LENGTH ? 'invalid text-right' : 'text-right'}, `${this.messageLength} / ${Utils.MAX_LENGTH}`),
                    h('button', {class:'btn text-primary', onclick:this.onCancel}, 'CANCEL'),
                    h('button', {class:'btn btn-primary ml-2', onclick:this.onSubmit}, 'SEND')
                );
    }
}