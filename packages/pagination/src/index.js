import { tailwind } from './themes/tailwind.js';
import { en_US } from './i18n/en_US.js';

export * from './themes/tailwind.js';
export * from './themes/bootstrap5.js';
export * from './i18n/en_US.js';
export * from './i18n/zh_TW.js';

const data_get = (obj, key) => {
    if (obj.hasOwnProperty(key)) {
        return obj[key];
    }

    const segments = key.split('.');

    let tmp = obj;
    while (segments.length > 0) {
        const segment = segments.shift();
        if (!tmp[segment]) {
            return key;
        }

        tmp = tmp[segment];
    }

    return tmp;
};

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

    constructor(options = {}, defaults = {}) {
        this.total = options.total ?? 0;
        this.per_page = options.per_page ?? 10;
        this.current_page = Math.max(options.current_page ?? 1, 1);
        this.on_each_side = options.on_each_side ?? 3;
        this.defaults = defaults;
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
        const i18n = this.defaults.i18n[this.defaults.lang];

        return Object
            .entries(parameters)
            .reduce((text, [key, value]) => {
                return text.replace(`:${key}`, value);
            }, data_get(i18n, key));
    }
}

export default function (Alpine, defaults = {}) {
    defaults = Alpine.reactive(mergeDeep({
        theme: 'tailwind',
        themes: { tailwind: tailwind },
        lang: 'en_US',
        i18n: { en_US },
    }, defaults));

    for (let x in defaults.themes) {
        if (defaults.themes[x] instanceof Function) {
            defaults.themes[x] = defaults.themes[x]();
        }
    }

    Alpine.data('PaginationComponent', (options) => new Paginator(options, defaults));

    const render = (value) => defaults.themes[value.theme ?? defaults.theme].template.replace(
        '{expression}', `PaginationComponent(${JSON.stringify(value)})`,
    );

    Alpine.directive('pagination', (el, { expression }, { evaluateLater, effect }) => {
        const evaluator = evaluateLater(expression);
        effect(() => evaluator(value => el.innerHTML = render(value)));
    });
}