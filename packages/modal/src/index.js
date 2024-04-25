const html = `
<div 
    x-show="open"
    @keydown.window.escape.prevent.stop="open = false"
    @click="close()"
    class="relative z-10" 
    aria-labelledby="modal-title" 
    role="dialog" 
    aria-modal="true"
>
    <!--
        Background backdrop, show/hide based on modal state.

        Entering: "ease-out duration-300"
          From: "opacity-0"
          To: "opacity-100"
        Leaving: "ease-in duration-200"
          From: "opacity-100"
          To: "opacity-0"
    -->
    <div x-show="open" x-transition.opacity class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
    
    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <!--
                Modal panel, show/hide based on modal state.

                Entering: "ease-out duration-300"
                  From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  To: "opacity-100 translate-y-0 sm:scale-100"
                Leaving: "ease-in duration-200"
                  From: "opacity-100 translate-y-0 sm:scale-100"
                  To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            -->
            <div x-on:click.stop x-transition class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button @click="close()" type="button" class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span class="sr-only">Close</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="sm:flex sm:items-start">
                    <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div class="flex-1 mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title" x-show="title" x-html="title"></h3>
                        <div class="mt-2">
                            <p class="text-sm text-gray-500" x-show="message" x-html="message"></p>
                            <template x-if="prompt">
                                <input x-model="input" type="text" class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            </template>
                        </div>
                    </div>
                </div>
                <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <template x-for="button of buttons">
                        <button @click="button.handle()" type="button" :class="button.class" x-html="button.text"></button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</div>
`;
const emptyFn = () => {
};
export default function (Alpine) {
    const component = document.createElement('div');
    component.setAttribute('x-data', 'ModalComponent');
    component.innerHTML = html;
    document.body.appendChild(component);

    const modal = Alpine.reactive({
        open: false,
        callback: null,
        title: '',
        message: '',
        prompt: false,
        input: '',
        _buttons: [{}],
        get buttons() {
            return this._buttons.map((button) => {
                const handle = button.handle ?? emptyFn;
                button.handle = () => handle(this);

                return button;
            });
        },
        async show(attributes) {
            this.title = attributes.title ?? '';
            this.message = attributes.message ?? '';
            this.prompt = attributes.prompt ?? false;
            this.input = '';
            this._buttons = attributes.buttons ?? [];

            this.open = true;

            return new Promise((resolve) => {
                this.callback = (result) => resolve(result);
            });
        },
        close(result = undefined) {
            if (this.callback instanceof Function) {
                this.callback(result);
                this.callback = null;
            }
            this.open = false;
        },
    });

    Alpine.data('ModalComponent', () => modal);

    Object.defineProperty(Alpine, '$alert', {
        get: () => async (message, attributes) => {
            return modal.show({
                ...attributes,
                message,
                buttons: [{
                    class: 'inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto',
                    text: 'Ok',
                    handle(instance) {
                        instance.close();
                    },
                }],
            });
        },
    });

    Object.defineProperty(Alpine, '$confirm', {
        get: () => async (message, attributes) => {
            return modal.show({
                ...attributes,
                message,
                buttons: [{
                    class: 'inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto',
                    text: 'Ok',
                    handle(instance) {
                        instance.close(true);
                    },
                }, {
                    class: 'mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto',
                    text: 'Cancel',
                    handle(instance) {
                        instance.close();
                    },
                }],
            });
        },
    });

    Object.defineProperty(Alpine, '$prompt', {
        get: () => async (message, attributes) => {
            return modal.show({
                ...attributes,
                message,
                prompt: true,
                buttons: [{
                    class: 'inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto',
                    text: 'Ok',
                    handle(instance) {
                        instance.close(instance.input);
                    },
                }, {
                    class: 'mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto',
                    text: 'Cancel',
                    handle(instance) {
                        instance.close();
                    },
                }],
            });
        },
    });
}