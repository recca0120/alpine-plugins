class MessageBag {
    constructor(errors = {}) {
        this.errors = errors;
    }

    set(key, value) {
        return this.put(key, value);
    }

    put(key, value) {
        const values = typeof key === 'object' ? key : { [key]: value };

        for (const x in values) {
            let val = values[x];

            this.errors[x] = typeof val === 'string' ? [val] : val;
        }

        return this;
    }

    get(key) {
        if (!this.errors.hasOwnProperty(key) || !this.errors[key]) {
            this.put(key, null);
        }

        return this.errors[key];
    }

    has(key) {
        return this.get(key) !== null;
    }

    first(key) {
        if (!this.has(key)) {
            return null;
        }

        const value = this.get(key);

        return value instanceof Array ? value[0] : value;
    }

    remove(...keys) {
        keys.forEach(key => this.put(key, null));
    }

    clear() {
        this.remove(...Object.keys(this.errors));
    }

    all() {
        return Object.keys(this.errors).reduce((acc, key) => {
            const value = this.get(key);

            return value === null ? acc : { ...acc, [key]: value };
        }, {});
    }

    registerAxiosInterceptor(axios) {
        const beforeRequest = (config) => {
            this.clear();

            return config;
        };
        const onError = (err) => {
            const { status, data } = err.response;

            if (status === 422) {
                this.set(data.errors);
            }

            return Promise.reject(err);
        };

        axios.interceptors.request.use(beforeRequest, err => Promise.reject(err));
        axios.interceptors.response.use(response => response, onError);
    }
}

export default function (Alpine) {
    const errors = Alpine.reactive(new MessageBag());
    Alpine.magic('errors', () => errors);
    Object.defineProperty(Alpine, 'errors', { get: () => errors });
}