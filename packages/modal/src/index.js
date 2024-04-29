import { en_US } from './i18n';
import { tailwind } from './themes';
import { data_get, deepMerge, deferred, emptyFn } from './utils.js';

export * from './i18n';
export * from './themes';

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

    constructor(config = {}) {
        this.config = config;
    }

    get buttons() {
        const { classes } = this.config.themes[this.config.theme];
        const self = this;

        return this._buttons.map((button) => {
            const handle = button.handle ?? emptyFn;
            button.handle = (event) => handle.call(self, event, self);
            if (!button.hasOwnProperty('className')) {
                button.className = classes.secondary;
            }

            return button;
        });
    }

    get currentTheme() {
        return this.config.themes[this.config.theme];
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
        this._buttons = options.buttons ?? [{
            className: this.currentTheme.classes.primary,
            text: this.__('alert.ok'),
            handle: (event, instance) => instance.close(),
        }];
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

    async hide(result = undefined) {
        return this.close(result);
    }

    async alert(message, options) {
        const { classes } = this.currentTheme;

        return this.show({
            message,
            backdrop: this.config.alert.backdrop,
            keyboard: this.config.alert.keyboard,
            showCloseButton: this.config.alert.showCloseButton,
            buttons: [{
                className: classes.primary,
                text: this.__('alert.ok'),
                handle(_event, instance) {
                    instance.close();
                },
            }],
            ...options,
        });
    };

    async confirm(message, options) {
        const { classes } = this.currentTheme;

        return this.show({
            message,
            backdrop: this.config.confirm.backdrop,
            keyboard: this.config.confirm.keyboard,
            showCloseButton: this.config.confirm.showCloseButton,
            buttons: [{
                className: classes.primary,
                text: this.__('confirm.ok'),
                handle(_event, instance) {
                    instance.close(true);
                },
            }, {
                text: this.__('confirm.cancel'),
                handle(_event, instance) {
                    instance.close(false);
                },
            }],
            ...options,
        });
    };

    async prompt(message, options) {
        const { classes } = this.currentTheme;

        return this.show({
            message,
            isPrompt: true,
            backdrop: this.config.prompt.backdrop,
            keyboard: this.config.prompt.keyboard,
            showCloseButton: this.config.prompt.showCloseButton,
            buttons: [{
                className: classes.primary,
                text: this.__('prompt.ok'),
                handle(_event, instance) {
                    if (!instance.input) {
                        instance.invalid = true;
                    } else {
                        instance.close(instance.input);
                    }
                },
            }, {
                text: this.__('prompt.cancel'),
                handle(_event, instance) {
                    instance.close();
                },
            }],
            ...options,
        });
    };

    __(key, parameters = {}) {
        const i18n = this.config.i18n[this.config.lang];

        return Object
            .entries(parameters)
            .reduce((text, [key, value]) => {
                return text.replace(`:${key}`, value);
            }, data_get(i18n, key));
    }
}

export default function (Alpine) {
    const config = {
        theme: 'tailwind',
        themes: { tailwind: tailwind() },
        alert: { backdrop: false, keyboard: false, showCloseButton: false },
        confirm: { backdrop: false, keyboard: false, showCloseButton: false },
        prompt: { backdrop: false, keyboard: false, showCloseButton: false },
        lang: 'en_US',
        i18n: { en_US },
    };

    const instance = (name = '') => {
        const id = ['ModalComponent', name].filter(v => !!v).join('_');

        let component = document.querySelector(`[x-modal=${id}]`);
        if (component) {
            return component.x_modal;
        }

        component = document.createElement('div');
        component.setAttribute('x-data', id);
        component.setAttribute('x-modal', '');
        component.setAttribute('x-show', 'open');
        component.x_modal = Alpine.reactive(new Modal(config));
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

    const render = () => {
        return config.themes[config.theme].template;
    };
    Alpine.directive('modal', (el, { expression }, { effect }) => {
        effect(() => el.innerHTML = render());
    });

    Object.defineProperty(Alpine, 'modal', {
        get: () => ({
            config(key, value) {
                if (key instanceof Object) {
                    Object.entries(key).forEach(([k, v]) => this.config(k, v));

                    return this;
                }

                if (key === 'themes') {
                    Object.entries(value).forEach(([name, theme]) => this.addTheme(name, theme));

                    return this;
                }

                deepMerge(config, { [key]: value });

                return this;
            },
            theme(name) {
                config.theme = name;

                return this;
            },
            addTheme(name, theme) {
                deepMerge(config, { themes: { [name]: theme instanceof Function ? theme() : theme } });

                return this;
            },
            i18n(name, lang) {
                deepMerge(config, { i18n: { [name]: lang } });

                return this;
            },
        }),
    });
}