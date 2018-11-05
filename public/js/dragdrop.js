'use strict';

(function($) {
    const IMAGE_WIDTH = 64;
    const IMAGE_HEIGHT = 64;

    class DragDrop extends EventEmitter {
        constructor(types, el, readFile) {
            super();

            this.readFile = readFile;
            this.types = types || ['png','jpg','jpeg','mp4','mp3','wav'];
            this.el = el;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');

            this.canvas.width = IMAGE_WIDTH;
            this.canvas.height = IMAGE_HEIGHT;

            this.boundOnDragOver = this.onDragOver.bind(this);
            this.boundOnDrop = this.onDrop.bind(this);
            this.boundOnDragStart = this.onDragStart.bind(this);

            if(this.el) {
                console.log('drop element is valid');
                this.el.addEventListener('dragover', this.boundOnDragOver, false);
                this.el.addEventListener('drop', this.boundOnDrop, false);
                this.el.addEventListener('dragstart', this.boundOnDragStart, false);
            }
        }

        onDragStart(e) {
            e.preventDefault();
            e.stopPropagation();

            e.dataTransfer.dropEffect = 'copy';
        }

        onDrop(e) {
            e.preventDefault();
            e.stopPropagation();

            const files = e.dataTransfer.files;
            if(files.length > 0) {
                this.handleFile(files[0]);
            }
        }

        onDragOver(e) {
            e.preventDefault();
            e.stopPropagation();

            e.dataTransfer.dropEffect = 'copy';
        }

        dispose() {
            this.el.removeEventListener('dragover', this.boundOnDragOver);
            this.el.removeEventListener('drop', this.boundOnDrop);
            this.el.removeEventListener('dragstart', this.boundOnDragStart);
        }

        handleFile(f) {
            let isValid = false;
            for(let i = 0; i < this.types.length; i++) {
                const type = this.types[i];
                if(f.type.indexOf(type.replace(/[.]/gi, '')) > -1) {
                    isValid = true;
                    break;
                }    
            }

            if(isValid) {
                this.emit('file', f);

                if(typeof FileReader !== 'undefined' && this.readFile) {
                    const reader = new FileReader();

                    reader.onload = (evt) => {
                        const img = new Image();
                        img.onload = () => {
                            this.emit('data', this.getDataURI(img));
                        };
                        img.src = evt.target.result;             
                    }

                    reader.readAsDataURL(f);
                }
            }
        }

        getDataURI(img) {
            const size = Math.min(img.width, img.height);
            const left = (img.width - size) / 2;
            const top = (img.height - size) / 2;
            this.ctx.clearRect(0,0,IMAGE_WIDTH,IMAGE_HEIGHT);
            this.ctx.drawImage(img,left,top,size,size,0,0,IMAGE_WIDTH,IMAGE_HEIGHT);
            return this.canvas.toDataURL('image/jpeg', 0.5);
        }
    }

    window.DragDrop = DragDrop;
})();
