class Primitive {
    constructor(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    static is(value) {
        return [true, false, null, undefined].includes(value);
    }
}

class MessageBag {
    constructor(errors = {}) {
        this._errors = errors;
    }

    set(key, value) {
        return this.put(key, value);
    }

    put(key, value) {
        const values = typeof key === 'object' ? key : {[key]: value};

        for (const x in values) {
            let val = values[x];
            if (Primitive.is(val)) {
                val = new Primitive(val);
            }

            this._errors[x] = typeof val === 'string' ? [val] : val;
        }

        return this;
    }

    get(key) {
        if (!this._errors.hasOwnProperty(key) || !this._errors[key]) {
            this.put(key, null);
        }

        if (this._errors[key] instanceof Primitive) {
            return this._errors[key].getValue();
        }

        return this._errors[key];
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
        this.remove(...Object.keys(this._errors));
    }

    all() {
        return Object.keys(this._errors).reduce((acc, key) => {
            const value = this.get(key);

            return value === null ? acc : {...acc, [key]: value};
        }, {});
    }
}

export default function (Alpine) {
    const errors = new MessageBag(Alpine.reactive({}));

    Alpine.magic('errors', () => errors);
    Object.defineProperty(Alpine, '$errors', {get: () => errors});
}