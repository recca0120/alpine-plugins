const template = `
<nav x-data='{expression}' x-cloak x-show="hasPages()" :aria-label="__('Pagination Navigation')" class="flex items-center justify-between" role="navigation">
    <div class="flex justify-between flex-1 sm:hidden">
        <span x-show="onFirstPage()" x-html="__('pagination.previous')" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-default leading-5 rounded-md dark:text-gray-600 dark:bg-gray-800 dark:border-gray-600">
        </span>
        <a x-show="!onFirstPage()" @click.prevent="$dispatch('change', current_page - 1)" x-html="__('pagination.previous')"  href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 leading-5 rounded-md hover:text-gray-500 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:focus:border-blue-700 dark:active:bg-gray-700 dark:active:text-gray-300">
        </a>
        
        <a x-show="hasMorePages()" 
           @click.prevent="$dispatch('change', current_page + 1)"
           x-html="__('pagination.next')"
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
                   @click.prevent="change(current_page - 1)"
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
                           @click.prevent="change(page)" 
                           :aria-label="__('Go to page :page', {page: page})"
                           href="#" 
                           class="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium text-gray-700 bg-white border border-gray-300 leading-5 hover:text-gray-500 focus:z-10 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-300 dark:active:bg-gray-700 dark:focus:border-blue-800">
                        </a>
                    </span>
                </template>
            
                <a x-show="hasMorePages()" 
                   @click.prevent="change(current_page + 1)"
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

export const tailwind = () => ({ template });