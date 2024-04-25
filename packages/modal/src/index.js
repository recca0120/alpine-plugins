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
        return this._buttons.map((button) => {
            const handle = button.handle ?? emptyFn;
            button.handle = () => handle(this);

            return button;
        });
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
        return new Promise(resolve => {
            this.open = false;
            setTimeout(() => {
                if (this.deferred) {
                    this.deferred.resolve(result);
                    this.deferred = null;
                }
                resolve();
            }, 250);
        });
    }

    async alert(message, options) {
        return this.show({
            message,
            backdrop: this.defaults.alert.isPrompt,
            keyboard: this.defaults.alert.keyboard,
            buttons: [{
                ...this.defaults.alert.buttons.ok,
                handle(instance) {
                    instance.close();
                },
            }],
            ...options,
        });
    };

    async confirm(message, options) {
        return this.show({
            message,
            backdrop: this.defaults.confirm.isPrompt,
            keyboard: this.defaults.confirm.keyboard,
            buttons: [{
                ...this.defaults.confirm.buttons.ok,
                handle(instance) {
                    instance.close(true);
                },
            }, {
                ...this.defaults.confirm.buttons.cancel,
                handle(instance) {
                    instance.close(false);
                },
            }],
            ...options,
        });
    };

    async prompt(message, options) {
        return this.show({
            message,
            isPrompt: true,
            backdrop: this.defaults.prompt.isPrompt,
            keyboard: this.defaults.prompt.keyboard,
            buttons: [{
                ...this.defaults.prompt.buttons.ok,
                handle(instance) {
                    if (!instance.input) {
                        instance.invalid = true;
                    } else {
                        instance.close(instance.input);
                    }
                },
            }, {
                ...this.defaults.prompt.buttons.cancel,
                handle(instance) {
                    instance.close();
                },
            }],
            ...options,
        });
    };
}

export default function (Alpine, defaults = {}) {
    const { buttons, views } = tailwind();
    defaults = Alpine.reactive({
        views,
        alert: {
            backdrop: false,
            keyboard: false,
            buttons: { ok: buttons.ok },
        },
        confirm: {
            backdrop: false,
            keyboard: false,
            buttons: { ok: buttons.ok, cancel: buttons.cancel },
        },
        prompt: {
            backdrop: false,
            keyboard: false,
            buttons: { ok: buttons.ok, cancel: buttons.cancel },
        },
        ...buttons,
    });

    const component = document.createElement('div');
    component.setAttribute('x-data', 'ModalComponent');
    component.innerHTML = defaults.views.templates[defaults.views._default];
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