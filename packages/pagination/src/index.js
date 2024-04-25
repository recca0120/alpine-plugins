export * from './templates/tailwind.js';
export * from './templates/bootstrap5.js';
import { tailwind } from './templates/tailwind.js';

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
            return {'first': null, 'slider': null, 'last': null};
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

export default function (Alpine) {
    let i18n = {
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
    const templates = {tailwind: tailwind()};

    let defaults = 'tailwind';
    const render = (value) => templates[value.template ?? defaults].replace(
        '{expression}', `PaginationComponent(${JSON.stringify(value)})`,
    );

    Alpine.directive('pagination', (el, {expression}, {evaluateLater, effect}) => {
        const evaluator = evaluateLater(expression);
        effect(() => evaluator(value => el.innerHTML = render(value)));
    });

    Alpine.data('PaginationComponent', (options) => {
        return {
            total: options.total ?? 0,
            per_page: options.per_page ?? 10,
            current_page: Math.max(options.current_page ?? 1, 1),
            on_each_side: options.on_each_side ?? 3,
            get onEachSide() {
                return this.on_each_side;
            },
            get last_page() {
                return Math.ceil(this.total / this.perPage());
            },
            get from() {
                return ((this.currentPage() - 1) * this.perPage()) + 1;
            },
            get to() {
                return Math.min(this.currentPage() * this.perPage(), this.total);
            },
            perPage() {
                return this.per_page;
            },
            currentPage() {
                return this.current_page;
            },
            lastPage() {
                return this.last_page;
            },
            onFirstPage() {
                return !this.currentPage() || this.currentPage() <= 1;
            },
            hasPages() {
                return this.currentPage() !== 1 || this.hasMorePages();
            },
            hasMorePages() {
                return !!this.currentPage() && this.currentPage() < this.last_page;
            },
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
            },
            change(page) {
                if (page !== '...') {
                    this.$dispatch('change', page);
                }
            },
            __(key, parameters = {}) {
                return Object.entries(parameters).reduce((text, [key, value]) => text.replace(`:${key}`, value), i18n[key]);
            },
            /** @returns {number[]} */
            getUrlRange(start, stop, step = 1) {
                const range = [];
                for (let i = start; i <= stop; i += step) {
                    range.push(i);
                }

                return range;
            },
        };
    });

    return {
        use(name) {
            defaults = name;

            return this;
        },
        template(name, html) {
            templates[name] = html instanceof Function ? html() : html;

            return this;
        },
        i18n(key, value) {
            if (typeof key === 'object') {
                i18n = {...i18n, ...key};
            } else {
                i18n[key] = value;
            }
        },
    };
}