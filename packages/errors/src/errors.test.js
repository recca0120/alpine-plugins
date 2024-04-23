import Alpine from 'alpinejs';
import { fireEvent, screen } from '@testing-library/dom';
import plugin from './index.js';

describe('Alpine $errors', () => {
    const givenComponent = (name) => {
        const component = document.createElement('div');
        component.innerHTML = `
            <div x-data>
                <div class="input-group">
                    <input
                        type="text"
                        name="${name}"
                        class="form-control"
                        @keyup="$errors.remove('${name}')"
                        :class="{'is-invalid': $errors.has('${name}')}"
                        role="input" />
                </div>
                <template x-if="$errors.has('${name}')">
                    <div class="invalid-feedback" x-text="$errors.first('${name}')" role="error-message"></div>
                </template>
            </div>
        `;
        document.body.append(component);

        return component;
    };

    beforeAll(() => {
        plugin(Alpine);
        Alpine.start();
    });

    afterAll(() => Alpine.stopObservingMutations());

    beforeEach(() => {
        document.body.innerHTML = '';
        givenComponent('username');
        givenComponent('password');
    });

    afterEach(() => document.body.innerHTML = '');

    const getInvalidInputs = () => screen.queryAllByRole('input').filter(el => el.classList.contains('is-invalid'));
    const getErrorMessages = () => screen.queryAllByRole('error-message');

    async function expectShowError() {
        const validateError = {
            'status': 'fail',
            'message': '發生錯誤！',
            'errors': {'username': ['帳號 已經存在。']},
            'error': '帳號 已經存在。',
        };
        await Alpine.nextTick(() => Alpine.$errors.set(validateError.errors));

        expect(getInvalidInputs()).toHaveLength(1);
        expect(getErrorMessages()).toHaveLength(1);
        expect(getErrorMessages()[0].innerHTML).toContain('帳號 已經存在。');
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

        expect(invalidInput.classList).not.toContain('is-invalid');
    });
});