import { fireEvent, screen } from '@testing-library/dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Alpine from 'alpinejs';
import plugin from '../src';

describe('Alpine $errors', () => {
    const givenComponent = (name) => {
        const component = document.createElement('div');
        component.innerHTML = `
            <div x-data>
                <div>
                    <label for="${name}" class="block text-sm font-medium leading-6 text-gray-900">${name}</label>
                    <div class="relative mt-2 rounded-md shadow-sm">
                        <input type="text" name="${name}" id="${name}"
                               class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                               :class="{'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500': $errors.has('${name}')}"
                               @keyup="$errors.remove('${name}')"
                               role="input">
                    </div>

                    <template x-if="$errors.has('${name}')">
                        <p x-text="$errors.first('${name}')" class="mt-2 text-sm text-red-600" id="${name}-error" role="error-message"></p>
                    </template>
                </div>
            </div>
        `;
        document.body.append(component);

        return component;
    };

    beforeAll(() => {
        plugin(Alpine);

        const mock = new MockAdapter(axios);
        mock.onPost('/users').reply(422, {
            'message': 'The email field must be a valid email address.',
            'errors': {'email': ['The email field must be a valid email address.']},
        });
        Alpine.$errors.registerAxiosInterceptor(axios);

        Alpine.start();
    });

    afterAll(() => Alpine.stopObservingMutations());

    beforeEach(() => {
        document.body.innerHTML = '';
        givenComponent('email');
        givenComponent('password');
    });

    afterEach(() => document.body.innerHTML = '');

    const getInvalidInputs = () => screen.queryAllByRole('input').filter(el => el.classList.contains('text-red-900'));
    const getErrorMessages = () => screen.queryAllByRole('error-message');

    async function expectShowError() {


        try {
            await axios.post('/users');
        } catch (e) {
        }

        expect(getInvalidInputs()).toHaveLength(1);
        expect(getErrorMessages()).toHaveLength(1);
        expect(getErrorMessages()[0].innerHTML).toContain('The email field must be a valid email address.');
    }

    it('show errors', async () => {
        await expectShowError();
    });

    it('clear errors', async () => {
        await expectShowError();

        await Alpine.nextTick(() => Alpine.$errors.clear());

        expect(getInvalidInputs()).toHaveLength(0);
        expect(getErrorMessages()).toHaveLength(0);
    });

    it('key up clear input error', async () => {
        await expectShowError();

        const invalidInput = getInvalidInputs()[0];
        await Alpine.nextTick(() => fireEvent.keyUp(invalidInput));

        expect(invalidInput.classList).not.toContain('text-red-900');
    });
});