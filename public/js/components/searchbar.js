'use strict';

class SearchBar extends Component {
    constructor(o, parent) {
        super(o,parent);
        this.onInput = this.onInput.bind(this);
        this.searchbar = null;
        
        this.onClear = this.onClear.bind(this);
        this.searchTimer = null;
    } 

    onInput(e) {
        if(this.searchTimer) {
            clearTimeout(this.searchTimer);
        }

        this.searchTimer = setTimeout(() => {
            if(e.target.value.length > 0) {
                if(e.target.value[0] === '#') {
                    location.hash = `#/tag/${e.target.value.substring(1)}`;
                }
                else if(e.target.value[0] === '$') {
                    location.hash = `#/post/${e.target.value.substring(1)}`;
                }
                else {
                    const v = e.target.value[0] === '@' ? e.target.value.substring(1) : e.target.value;
                    location.hash = `#/user/${v}`;
                }
            }
            else {
                location.hash = '#/discover';
            }
        }, 250);
    }

    onClear(e) {
        e.preventDefault();
        e.stopPropagation();

        this.searchbar.value = '';
        location.hash = '#/discover';
    }

    render() {
        return h('div', {class:'relative text-light'},
                    h('input', {type:'text', class:'form-control', ref: f => this.searchbar = f, oninput: this.onInput, placeholder:'#hashtag or @address'}),
                    h('button', {class:'input-clear fas fa-times', onclick:this.onClear})
                );
    }
}