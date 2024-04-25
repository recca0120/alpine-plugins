const template = `
<nav x-data='{expression}' x-cloak x-show="hasPages()" class="d-flex justify-items-center justify-content-between">
    <div class="d-flex justify-content-between flex-fill d-sm-none">
        <ul class="pagination">
            <li x-show="onFirstPage()" class="page-item disabled" aria-disabled="true">
                <span x-html="__('pagination.previous')" class="page-link"></span>
            </li>
            <li x-show="!onFirstPage()" class="page-item">
                <a @click.prevent="$dispatch('change', current_page - 1)"
                   x-html="__('pagination.previous')"
                   href="#"
                   class="page-link"
                   rel="prev">
                </a>
            </li>

            <li x-show="hasMorePages()" class="page-item">
                <a @click.prevent="$dispatch('change', current_page + 1)"
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
                    <a @click.prevent="change(current_page - 1)"
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
                           @click.prevent="change(page)"
                           href="#"
                           class="page-link"></a>
                    </li>
                </template>

                <li x-show="hasMorePages()" class="page-item">
                    <a @click.prevent="change(current_page + 1)"
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

export function bootstrap5() {
    const name = 'bootstrap5';

    return { views: { _default: name, templates: { [name]: template } } };
}