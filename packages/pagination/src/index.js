import { tailwind } from './templates/tailwind.js';
import { bootstrap5 } from './templates/bootstrap5.js';

/**
 * @returns {number[]}
 */
const range = (start, stop, step = 1) => {
    const r = [];
    for (let i = start; i <= stop; i += step) {
        r.push(i);
    }

    return r;
};

class UrlWindow {
    constructor(options) {
        this.options = options;
    }

    /**
     * @returns {({ first?: number[], slider?: number[], last?: number[] })}
     */
    get() {
        const onEachSide = this.options.onEachSide;

        if (this.lastPage() < (onEachSide * 2) + 8) {
            return this.getSmallSlider();
        }

        return this.getUrlSlider(onEachSide);
    }

    getSmallSlider() {
        return {
            'first': range(1, this.lastPage()), 'slider': null, 'last': null,
        };
    }

    getUrlSlider(onEachSide) {
        const window = onEachSide + 4;

        if (!this.hasPages()) {
            return {
                'first': null, 'slider': null, 'last': null,
            };
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
            'first': range(1, window + onEachSide), 'slider': null, 'last': this.getFinish(),
        };
    }

    getSliderTooCloseToEnding(window, onEachSide) {
        const last = range(this.lastPage() - (window + (onEachSide - 1)), this.lastPage());

        return {
            'first': this.getStart(), 'slider': null, 'last': last,
        };
    }

    getFullSlider(onEachSide) {
        return {
            'first': this.getStart(), 'slider': this.getAdjacentUrlRange(onEachSide), 'last': this.getFinish(),
        };
    }

    getAdjacentUrlRange(onEachSide) {
        return range(this.currentPage() - onEachSide, this.currentPage() + onEachSide);
    }

    getStart() {
        return range(1, 2);
    }

    getFinish() {
        return range(this.lastPage() - 1, this.lastPage());
    }

    hasPages() {
        return this.lastPage() > 1;
    }

    currentPage() {
        return this.options.current_page;
    }

    lastPage() {
        return this.options.last_page;
    }
}


export default function (Alpine) {
    Alpine.data('PaginationComponent', (options) => {
        return {
            total: options.total ?? 0,
            per_page: options.per_page ?? 10,
            current_page: Math.max(options.current_page ?? 1, 1),
            on_each_side: options.on_each_side ?? 3,
            get last_page() {
                return Math.ceil(this.total / this.per_page);
            },
            get from() {
                return ((this.current_page - 1) * this.per_page) + 1;
            },
            get to() {
                return Math.min(this.current_page * this.per_page, this.total);
            },
            onFirstPage() {
                return !this.current_page || this.current_page <= 1;
            },
            hasPages() {
                return this.current_page !== 1 || this.hasMorePages();
            },
            hasMorePages() {
                return !!this.current_page && this.current_page < this.last_page;
            },
            elements() {
                const window = new UrlWindow({
                    current_page: this.current_page,
                    last_page: this.last_page,
                    onEachSide: this.on_each_side,
                }).get();

                return [
                    window.first,
                    window.slider instanceof Array ? '...' : null,
                    window.slider,
                    window.last instanceof Array ? '...' : null,
                    window.last,
                ].filter((v) => !!v).reduce((elements, items) => {
                    return elements.concat(items instanceof String ? [items] : items);
                }, []);
            },
            __(key, parameters = {}) {
                const lookup = {
                    'Pagination Navigation': 'Pagination Navigation',
                    'pagination.previous': '&laquo; Previous',
                    'pagination.next': 'Next &raquo;',
                    'Go to page :page': 'Go to page :page',
                    'Showing': 'Showing',
                    'from': 'from',
                    'to': 'to',
                    'of': 'of',
                    'results': 'results',
                };

                return Object.entries(parameters).reduce((text, [key, value]) => text.replace(`:${key}`, value), lookup[key]);
            },
            change(page) {
                if (page !== '...') {
                    this.$dispatch('change', page);
                }
            },
        };
    });

    const render = (expression, view) => {
        if (view === 'bootstrap5') {
            return bootstrap5(expression);
        }

        return tailwind(expression);
    };

    Alpine.directive('pagination', (el, {expression}, {evaluateLater, effect}) => {
        const evaluator = evaluateLater(expression);
        effect(() => evaluator(value => el.innerHTML = render(JSON.stringify(value), value.view ?? 'tailwind')));
    });
}