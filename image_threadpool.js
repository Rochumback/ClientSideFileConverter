class Task {
    /**
        *@param {File} file
        * */
    constructor({ file, newFormat }) {
        this.name = file.name;
        this.bytes = file.arrayBuffer().then(buffer => new Uint8Array(buffer))
        this.newFormat = newFormat;
    }
}
/**
    *@template T
    * */
class CircularQueue {
    /**
        *@param { Iterable<T> } items
        * */
    constructor(items) {
        /** @type {Array<T>} queue */
        this.queue = new Array();
        this.iterations = 0;
        for (const item of items)
            this.queue.push(item);
    }
    /**
        * @returns {T} a next item from queue
        * */
    next() {
        this.iterations += 1;
        const current = this.iterations % this.queue.length;
        return this.queue[current];
    }
}

export class ImageThreadpool {
    constructor(size = navigator.hardwareConcurrency) {
        /**@type {Task[]}*/
        this.tasks = [];
        /**@type {Worker[]}*/
        const workerArray = [];
        this.running = false;
        for (let i = 0; i < size; i++) {
            const worker = new Worker("./worker.js", { type: "module" });
            worker.onerror = console.error;
            worker.onmessage = function(message) {
                const images = JSON.parse(sessionStorage.getItem("images")) || [];
                const total = document.getElementById("total-images");
                images.push({ filename: message.data.filename, url: message.data.imageURL })
                sessionStorage.setItem("images", JSON.stringify(images))
                total.textContent = Object.entries(images).length;
            }
            workerArray.push(worker);
        }
        /**
            * @type { CircularQueue<Worker> }
            * */
        this.workers = new CircularQueue(workerArray);
    }
    /**
        *@param {File} file
        * */
    addTask(file) {
        const task = new Task(file);
        this.tasks.push(task);
        this.start()
    }
    async start() {
        if (this.running) return;
        this.running = true;
        while (this.tasks.length > 0) {
            const task = this.tasks.shift();
            if (!task) return;

            const worker = this.workers.next();
            worker.postMessage({ filename: task.name, newFormat: task.newFormat, bytes:await  task.bytes })
        }
        this.running = false;
    }
}

export default ImageThreadpool
