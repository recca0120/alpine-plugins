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

    get() {
        const onEachSide = this.options.onEachSide;

        if (this.lastPage() < (onEachSide * 2) + 8) {
            return this.getSmallSlider();
        }

        return this.getUrlSlider(onEachSide);
    }

    getSmallSlider() {
        return {
            'first': range(1, this.lastPage()),
            'slider': null,
            'last': null,
        };
    }

    getUrlSlider(onEachSide) {
        const window = onEachSide + 4;

        if (!this.hasPages()) {
            return {
                'first': null,
                'slider': null,
                'last': null,
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
            'first': range(1, window + onEachSide),
            'slider': null,
            'last': this.getFinish(),
        };
    }

    getSliderTooCloseToEnding(window, onEachSide) {
        const last = range(this.lastPage() - (window + (onEachSide - 1)), this.lastPage());

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

const bootstrap5 = (expression) => {
    return `<nav x-data='PaginationComponent(${expression})' x-show="hasPages()" class="d-flex justify-items-center justify-content-between">
    <div class="d-flex justify-content-between flex-fill d-sm-none">
        <ul class="pagination">
            <li x-show="onFirstPage()" class="page-item disabled" aria-disabled="true">
                <span x-text="__('pagination.previous')" class="page-link"></span>
            </li>
            <li x-show="!onFirstPage()" class="page-item">
                <a @click="$dispatch('change', current_page - 1)"
                   x-text="__('pagination.previous')"
                   href="#"
                   class="page-link"
                   rel="prev">
                </a>
            </li>

            <li x-show="hasMorePages()" class="page-item">
                <a @click="$dispatch('change', current_page + 1)"
                   x-text="__('pagination.next')"
                   href="#"
                   class="page-link"
                   rel="next"
                ></a>
            </li>
            <li x-show="!hasMorePages()" class="page-item disabled" aria-disabled="true">
                <span x-text="__('pagination.next')" class="page-link"></span>
            </li>
        </ul>
    </div>

    <div class="d-none flex-sm-fill d-sm-flex align-items-sm-center justify-content-sm-between">
        <div>
            <p class="small text-muted">
                <span x-text="__('Showing')"></span>
                <span class="fw-semibold" x-text="from"></span>
                <span x-text="__('to')"></span>
                <span class="fw-semibold" x-text="to"></span>
                <span x-text="__('of')"></span>
                <span class="fw-semibold" x-text="total"></span>
                <span x-text="__('results')"></span>
            </p>
        </div>

        <div>
            <ul class="pagination">
                <li x-show="onFirstPage()" :aria-label="__('pagination.previous')" class="page-item disabled" aria-disabled="true">
                    <span class="page-link">&laquo;</span>
                </li>
                <li x-show="!onFirstPage()" class="page-item">
                    <a @click="change(current_page - 1)"
                       :aria-label="__('pagination.previous')"
                       href="#"
                       class="page-link"
                       rel="prev">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>

                <template x-for="page in elements()">
                    <li :class="{
                            'disabled': page === '...',
                            'active': page === current_page,
                        }"
                        class="page-item"
                        aria-disabled="true"
                    >
                        <span x-show="page === current_page || page === '...'" 
                              x-text="page" 
                              class="page-link"></span>
                        <a x-show="page !== current_page && page !== '...'"
                           x-text="page"
                           @click="change(page)"
                           href="#"
                           class="page-link"></a>
                    </li>
                </template>

                <li x-show="hasMorePages()" class="page-item">
                    <a @click="change(current_page + 1)"
                       :aria-label="__('pagination.next')"
                       href="#"
                       class="page-link"
                       rel="next">&raquo;</a>
                </li>
                <li x-show="!hasMorePages()" :aria-label="__('pagination.next')" class="page-item disabled" aria-disabled="true">
                    <span class="page-link">&raquo;</span>
                </li>
            </ul>
        </div>
    </div>
</nav>`;
};

const tailwind = (expression) => {
    return `<nav x-data='PaginationComponent(${expression})' x-show="hasPages()" :aria-label="__('Pagination Navigation')" class="flex items-center justify-between" role="navigation">
    <div class="flex justify-between flex-1 sm:hidden">
        <span x-show="onFirstPage()" x-text="__('pagination.previous')" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-default leading-5 rounded-md dark:text-gray-600 dark:bg-gray-800 dark:border-gray-600">
        </span>
        <a x-show="!onFirstPage()" @click="$dispatch('change', current_page - 1)" x-text="__('pagination.previous')"  href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 leading-5 rounded-md hover:text-gray-500 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:focus:border-blue-700 dark:active:bg-gray-700 dark:active:text-gray-300">
        </a>
        
        <a x-show="hasMorePages()" 
           @click="$dispatch('change', current_page + 1)"
           x-text="__('pagination.next')"
           href="#"
           class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 leading-5 rounded-md hover:text-gray-500 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:focus:border-blue-700 dark:active:bg-gray-700 dark:active:text-gray-300">
        </a>
        <span x-show="!hasMorePages()" 
              x-text="__('pagination.next')"
              class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-default leading-5 rounded-md dark:text-gray-600 dark:bg-gray-800 dark:border-gray-600">
        </span>
    </div>
    
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
            <p class="text-sm text-gray-700 leading-5 dark:text-gray-400">
                <span x-text="__('Showing')"></span>
                <span class="font-medium" x-text="from"></span>
                <span x-text="__('to')"></span>
                <span class="font-medium" x-text="to"></span>
                <span x-text="__('of')"></span>
                <span class="font-medium" x-text="total"></span>
                <span x-text="__('results')"></span>
            </p>
        </div>
        
        <div>
            <span class="relative z-0 inline-flex rtl:flex-row-reverse shadow-sm rounded-md">
                <span x-show="onFirstPage()" :aria-label="__('pagination.previous')" aria-disabled="true">
                    <span class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-default rounded-l-md leading-5 dark:bg-gray-800 dark:border-gray-600" aria-hidden="true">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </span>
                </span> 
                
                <a x-show="!onFirstPage()"
                   @click="change(current_page - 1)"
                   :aria-label="__('pagination.previous')"
                   href="#"
                   class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 dark:bg-gray-800 dark:border-gray-600 dark:active:bg-gray-700 dark:focus:border-blue-800" 
                   rel="prev">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </a>
            
                <template x-for="page in elements()">
                    <span>
                        <span x-show="page === '...'" aria-disabled="true">
                           <span x-text="page" class="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium text-gray-700 bg-white border border-gray-300 cursor-default leading-5 dark:bg-gray-800 dark:border-gray-600"></span>
                        </span>
                        
                        <span x-show="page === current_page" aria-current="page">
                            <span x-text="page" class="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-default leading-5 dark:bg-gray-800 dark:border-gray-600"></span>
                        </span>
                        
                        <a x-show="page !== current_page && page !== '...'"
                           x-text="page"
                           @click="change(page)" 
                           :aria-label="__('Go to page :page', {page: page})"
                           href="#" 
                           class="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium text-gray-700 bg-white border border-gray-300 leading-5 hover:text-gray-500 focus:z-10 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-300 dark:active:bg-gray-700 dark:focus:border-blue-800">
                        </a>
                    </span>
                </template>
            
                <a x-show="hasMorePages()" 
                   @click="change(current_page + 1)"
                   :aria-label="__('pagination.next')"
                   href="#" 
                   rel="next" 
                   class="relative inline-flex items-center px-2 py-2 -ml-px text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 dark:bg-gray-800 dark:border-gray-600 dark:active:bg-gray-700 dark:focus:border-blue-800">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                </a>
                
                <span x-show="!hasMorePages()" 
                      :aria-label="__('pagination.next')"
                      aria-disabled="true">
                    <span class="relative inline-flex items-center px-2 py-2 -ml-px text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-default rounded-r-md leading-5 dark:bg-gray-800 dark:border-gray-600" aria-hidden="true">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                    </span>
                </span>
            </span>
        </div>
    </div>
</nav>`;
};

export default function (Alpine) {
    Alpine.data('PaginationComponent', (options) => {
        return {
            total: options.total ?? 0,
            per_page: options.per_page ?? 10,
            current_page: options.current_page ?? 0,
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

    Alpine.directive('pagination', (el, {expression}, {evaluateLater, effect}) => {
        const evaluator = evaluateLater(expression);
        effect(() => evaluator(value => el.innerHTML = tailwind(JSON.stringify(value))));
    });
}