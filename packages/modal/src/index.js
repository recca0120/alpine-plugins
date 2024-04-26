export { tailwind } from './themes/tailwind.js';
import { tailwind } from './themes/tailwind.js';

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
function mergeDeep(...objects) {
    const isObject = obj => obj && typeof obj === 'object';

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            } else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            } else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}

const emptyFn = () => {
};

const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    return { promise, reject, resolve };
};

class Modal {
    deferred = null;
    open = false;
    title = '';
    message = '';
    isPrompt = false;
    showCloseButton = false;
    input = '';
    invalid = false;
    backdrop = true;
    keyboard = true;
    _buttons = [{}];

    constructor(defaults = {}) {
        this.defaults = defaults;
    }

    get buttons() {
        const { classes } = this.defaults.themes[this.defaults.theme];

        return this._buttons.map((button) => {
            const handle = button.handle ?? emptyFn;
            button.handle = () => handle(this);
            if (!button.hasOwnProperty('className')) {
                button.className = classes.secondary;
            }

            return button;
        });
    }

    get duration() {
        const duration = this?.$root.querySelector('[x-transition\\:leave]');
        const matched = duration?._x_transition?.leave.during.match(/duration-(\d+)/);

        return matched ? Math.max(parseInt(matched[1], 10), 0) : 0;
    }

    async show(options = {}) {
        this.title = options.title ?? '';
        this.message = options.message ?? '';
        this.isPrompt = options.isPrompt ?? false;
        this.showCloseButton = options.showCloseButton ?? false;
        this.input = '';
        this.invalid = false;
        this.backdrop = options.backdrop ?? true;
        this.keyboard = options.keyboard ?? true;
        this._buttons = options.buttons ?? [];
        this.open = true;
        this.deferred = deferred();

        return this.deferred.promise;
    }

    async close(result = undefined) {
        if (this.open === false) {
            return;
        }

        return new Promise(resolve => {
            this.open = false;

            setTimeout(() => {
                if (this.deferred) {
                    this.deferred.resolve(result);
                    this.deferred = null;
                }
                resolve();
            }, this.duration + 50);
        });
    }

    async alert(message, options) {
        const { classes } = this.defaults.themes[this.defaults.theme];

        return this.show({
            message,
            backdrop: this.defaults.alert.backdrop,
            keyboard: this.defaults.alert.keyboard,
            showCloseButton: this.defaults.alert.showCloseButton,
            buttons: [{
                className: classes.primary,
                text: this.__('alert.ok'),
                handle(instance) {
                    instance.close();
                },
            }],
            ...options,
        });
    };

    async confirm(message, options) {
        const { classes } = this.defaults.themes[this.defaults.theme];

        return this.show({
            message,
            backdrop: this.defaults.confirm.backdrop,
            keyboard: this.defaults.confirm.keyboard,
            showCloseButton: this.defaults.confirm.showCloseButton,
            buttons: [{
                className: classes.primary,
                text: this.__('confirm.ok'),
                handle(instance) {
                    instance.close(true);
                },
            }, {
                text: this.__('confirm.cancel'),
                handle(instance) {
                    instance.close(false);
                },
            }],
            ...options,
        });
    };

    async prompt(message, options) {
        const { classes } = this.defaults.themes[this.defaults.theme];

        return this.show({
            message,
            isPrompt: true,
            backdrop: this.defaults.prompt.backdrop,
            keyboard: this.defaults.prompt.keyboard,
            showCloseButton: this.defaults.prompt.showCloseButton,
            buttons: [{
                className: classes.primary,
                text: this.__('prompt.ok'),
                handle(instance) {
                    if (!instance.input) {
                        instance.invalid = true;
                    } else {
                        instance.close(instance.input);
                    }
                },
            }, {
                text: this.__('prompt.cancel'),
                handle(instance) {
                    instance.close();
                },
            }],
            ...options,
        });
    };

    __(key, parameters = {}) {
        return Object.entries(parameters).reduce((text, [key, value]) => text.replace(`:${key}`, value), this.defaults.i18n[key]);
    }
}

export default function (Alpine, defaults = {}) {
    defaults = Alpine.reactive(mergeDeep({
        theme: 'tailwind',
        themes: { tailwind: tailwind() },
        alert: { backdrop: false, keyboard: false, showCloseButton: false },
        confirm: { backdrop: false, keyboard: false, showCloseButton: false },
        prompt: { backdrop: false, keyboard: false, showCloseButton: false },
        i18n: {
            'alert.ok': 'Ok',
            'confirm.ok': 'Ok',
            'confirm.cancel': 'Cancel',
            'prompt.ok': 'Ok',
            'prompt.cancel': 'Cancel',
        },
    }, defaults));

    const instance = (name = '') => {
        const id = ['ModalComponent', name].filter(v => !!v).join('_');

        let component = document.querySelector(`[x-modal=${id}]`);
        if (component) {
            return component.x_modal;
        }

        component = document.createElement('div');
        component.setAttribute('x-data', id);
        component.setAttribute('x-modal', '');
        component.x_modal = Alpine.reactive(new Modal(defaults));
        document.body.appendChild(component);

        Alpine.data(id, () => component.x_modal);

        return component.x_modal;
    };

    const modal = instance();
    Object.defineProperty(modal, 'instance', { get: () => instance });
    Alpine.magic('modal', () => modal.bind(modal));
    Alpine.magic('alert', () => modal.alert.bind(modal));
    Alpine.magic('confirm', () => modal.confirm.bind(modal));
    Alpine.magic('prompt', () => modal.prompt.bind(modal));
    Object.defineProperty(Alpine, '$modal', { get: () => modal });
    Object.defineProperty(Alpine, '$alert', { get: () => modal.alert.bind(modal) });
    Object.defineProperty(Alpine, '$confirm', { get: () => modal.confirm.bind(modal) });
    Object.defineProperty(Alpine, '$prompt', { get: () => modal.prompt.bind(modal) });

    const render = () => defaults.themes[defaults.theme].template;

    Alpine.directive('modal', (el) => {
        el.innerHTML = render();
    });
}