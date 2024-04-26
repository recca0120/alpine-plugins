import { tailwind } from './templates/tailwind.js';

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
    input = '';
    invalid = false;
    backdrop = true;
    keyboard = true;
    _buttons = [{}];

    constructor(defaults = {}) {
        this.defaults = defaults;
    }

    get buttons() {
        const { classes } = this.defaults.views.templates[this.defaults.views._default];

        return this._buttons.map((button) => {
            const handle = button.handle ?? emptyFn;
            button.handle = () => handle(this);
            if (!button.hasOwnProperty('class')) {
                button.class = classes.secondary;
            }

            return button;
        });
    }

    get duration() {
        const duration = this?.$root.querySelector('[x-transition\\:leave]');
        const matched = duration?._x_transition?.leave.during.match(/duration-(\d+)/);

        return matched ? Math.max(parseInt(matched[1], 10), 0) : 0;
    }

    async show(options) {
        this.title = options.title ?? '';
        this.message = options.message ?? '';
        this.isPrompt = options.isPrompt ?? false;
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
        const { classes } = this.defaults.views.templates[this.defaults.views._default];

        return this.show({
            message,
            backdrop: this.defaults.views.alert.backdrop,
            keyboard: this.defaults.views.alert.keyboard,
            buttons: [{
                class: classes.primary,
                text: this.__('alert.ok'),
                handle(instance) {
                    instance.close();
                },
            }],
            ...options,
        });
    };

    async confirm(message, options) {
        const { classes } = this.defaults.views.templates[this.defaults.views._default];

        return this.show({
            message,
            backdrop: this.defaults.views.confirm.backdrop,
            keyboard: this.defaults.views.confirm.keyboard,
            buttons: [{
                class: classes.primary,
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
        const { classes } = this.defaults.views.templates[this.defaults.views._default];

        return this.show({
            message,
            isPrompt: true,
            backdrop: this.defaults.views.prompt.backdrop,
            keyboard: this.defaults.views.prompt.keyboard,
            buttons: [{
                class: classes.primary,
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
    defaults = Alpine.reactive({
        views: {
            _default: 'tailwind',
            templates: { tailwind: tailwind() },
            alert: { backdrop: false, keyboard: false },
            confirm: { backdrop: false, keyboard: false },
            prompt: { backdrop: false, keyboard: false },
        },
        i18n: {
            'alert.ok': 'Ok',
            'confirm.ok': 'Ok',
            'confirm.cancel': 'Cancel',
            'prompt.ok': 'Ok',
            'prompt.cancel': 'Cancel',
        },
    });

    const component = document.createElement('div');
    component.setAttribute('x-data', 'ModalComponent');
    component.innerHTML = defaults.views.templates[defaults.views._default].template;
    document.body.appendChild(component);

    const modal = Alpine.reactive(new Modal(defaults));
    Alpine.data('ModalComponent', () => modal);

    Alpine.magic('modal', () => modal.show.bind(modal));
    Alpine.magic('alert', () => modal.alert.bind(modal));
    Alpine.magic('confirm', () => modal.confirm.bind(modal));
    Alpine.magic('prompt', () => modal.prompt.bind(modal));
    Object.defineProperty(Alpine, '$modal', { get: () => modal.show.bind(modal) });
    Object.defineProperty(Alpine, '$alert', { get: () => modal.alert.bind(modal) });
    Object.defineProperty(Alpine, '$confirm', { get: () => modal.confirm.bind(modal) });
    Object.defineProperty(Alpine, '$prompt', { get: () => modal.prompt.bind(modal) });
}