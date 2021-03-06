class Compute {
    constructor(message, cb) {
        this.svx = new Solver('placeholder', MDIFF);
        this.mtx = new SimpleMiner(this.svx);
        this.cb = cb;
        this.waitTime = 1;
        this.message = message;
    }

    solve(wait) {
        this.waitTime = wait || 1;
        setTimeout(() => {
            this.run();
        }, 10);
    }

    run() {
        this.svx.updateKey(this.message.hash);

        const sol = this.mtx.run();
        if(sol) {
            this.message.solution = Array.prototype.slice.call(sol, 0);
            this.cb();
            return;
        }

        this.message.nonce++;
        setTimeout(() => {
            this.run();
        }, this.waitTime);
    }
}