import { en_US } from './i18n';
import { tailwind } from './themes';
import { data_get, deepMerge } from './utils.js';

export * from './i18n';
export * from './themes';

class UrlWindow {
    constructor(paginator) {
        this.paginator = paginator;
    }

    /** @returns {({ first?: number[], slider?: number[], last?: number[] })} */
    get() {
        const onEachSide = this.paginator.onEachSide;

        if (this.paginator.lastPage() < (onEachSide * 2) + 8) {
            return this.getSmallSlider();
        }

        return this.getUrlSlider(onEachSide);
    }

    getSmallSlider() {
        return {
            'first': this.paginator.getUrlRange(1, this.lastPage()),
            'slider': null,
            'last': null,
        };
    }

    getUrlSlider(onEachSide) {
        const window = onEachSide + 4;

        if (!this.hasPages()) {
            return { 'first': null, 'slider': null, 'last': null };
        }

        if (this.currentPage() <= window) {
            return this.getSliderTooCloseToBeginning(window, onEachSide);
        } else if (this.currentPage() > (this.lastPage() - window)) {
            return this.getSliderTooCloseToEnding(window, onEachSide);
        }

        return this.getFullSlider(onEachSide);
    }

    getSliderTooCloseToBeginning(window, onEachSide) {
        return {
            'first': this.paginator.getUrlRange(1, window + onEachSide),
            'slider': null,
            'last': this.getFinish(),
        };
    }

    getSliderTooCloseToEnding(window, onEachSide) {
        const last = this.paginator.getUrlRange(
            this.lastPage() - (window + (onEachSide - 1)),
            this.lastPage(),
        );

        return {
            'first': this.getStart(),
            'slider': null,
            'last': last,
        };
    }

    getFullSlider(onEachSide) {
        return {
            'first': this.getStart(),
            'slider': this.getAdjacentUrlRange(onEachSide),
            'last': this.getFinish(),
        };
    }

    getAdjacentUrlRange(onEachSide) {
        return this.paginator.getUrlRange(
            this.currentPage() - onEachSide,
            this.currentPage() + onEachSide,
        );
    }

    getStart() {
        return this.paginator.getUrlRange(1, 2);
    }

    getFinish() {
        return this.paginator.getUrlRange(
            this.lastPage() - 1,
            this.lastPage(),
        );
    }

    hasPages() {
        return this.paginator.lastPage() > 1;
    }

    currentPage() {
        return this.paginator.currentPage();
    }

    lastPage() {
        return this.paginator.lastPage();
    }
}

class Paginator {
    total = 0;
    per_page = 10;
    current_page = 1;
    on_each_side = 3;

    constructor(options = {}, config = {}) {
        this.total = options.total ?? 0;
        this.per_page = options.per_page ?? 10;
        this.current_page = Math.max(options.current_page ?? 1, 1);
        this.on_each_side = options.on_each_side ?? 3;
        this.config = config;
    }

    get onEachSide() {
        return this.on_each_side;
    }

    get last_page() {
        return Math.ceil(this.total / this.perPage());
    }

    get from() {
        return ((this.currentPage() - 1) * this.perPage()) + 1;
    }

    get to() {
        return Math.min(this.currentPage() * this.perPage(), this.total);
    }

    perPage() {
        return this.per_page;
    }

    currentPage() {
        return this.current_page;
    }

    lastPage() {
        return this.last_page;
    }

    onFirstPage() {
        return !this.currentPage() || this.currentPage() <= 1;
    }

    hasPages() {
        return this.currentPage() !== 1 || this.hasMorePages();
    }

    hasMorePages() {
        return !!this.currentPage() && this.currentPage() < this.last_page;
    }

    elements() {
        const window = new UrlWindow(this).get();

        return [
            window.first,
            window.slider instanceof Array ? '...' : null,
            window.slider,
            window.last instanceof Array ? '...' : null,
            window.last,
        ].filter((v) => !!v).reduce((elements, items) => {
            return elements.concat(items instanceof String ? [items] : items);
        }, []);
    }

    change(page) {
        const dispatch = this.$dispatch;

        if (dispatch && page !== '...') {
            dispatch('change', page);
        }
    }

    /** @returns {number[]} */
    getUrlRange(start, stop, step = 1) {
        const range = [];
        for (let i = start; i <= stop; i += step) {
            range.push(i);
        }

        return range;
    }

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
        lang: 'en_US',
        i18n: { en_US },
    };

    Alpine.data('PaginationComponent', (options) => new Paginator(options, config));

    const render = (value) => config.themes[value.theme ?? config.theme].template.replace(
        '{expression}', `PaginationComponent(${JSON.stringify(value)})`,
    );

    Alpine.directive('pagination', (el, { expression }, { evaluateLater, effect }) => {
        const evaluator = evaluateLater(expression);
        effect(() => evaluator(value => el.innerHTML = render(value)));
    });

    Object.defineProperty(Alpine, 'pagination', {
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