import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import he from 'he';
import Alpine from 'alpinejs';
import plugin, { bootstrap5 } from '../src';

describe('Alpine pagination directive', () => {
    const encode = (text) => {
        return he.encode(text, { 'useNamedReferences': true, 'decimal': true });
    };

    const getPages = pagination => Array.from(pagination.querySelectorAll('nav a[x-text="page"]'))
        .map((el) => el.textContent.trim())
        .map((text) => parseInt(text, 10))
        .filter((num) => num);

    /** @return HTMLElement */
    const getPrevOrNext = (pagination, filters) => {
        return Array.from(pagination.querySelectorAll('nav *'))
            .filter((el) => filters.some((f) => RegExp(f, 'i').test(encode(el.textContent.trim()))))
            .filter((el) => el._x_isShown)
            .map((el) => el.firstElementChild ? el.firstElementChild : el)[0];
    };

    const getPrev = (pagination) => getPrevOrNext(pagination, ['&laquo;', 'Previous']);
    const getNext = (pagination) => getPrevOrNext(pagination, ['Next', '&raquo;']);

    /** @return HTMLElement */
    const givenComponent = (options) => {
        const component = document.createElement('div');
        component.innerHTML = `
            <div x-data='{ pagination: ${JSON.stringify(options)} }'>
                <div x-pagination='pagination' data-testId="pagination"/>
            </div>
        `;
        document.body.append(component);

        return component;
    };

    beforeAll(() => {
        plugin(Alpine, { themes: { bootstrap5 } });
        Alpine.start();
    });

    afterAll(() => Alpine.stopObservingMutations());

    beforeEach(() => document.body.innerHTML = '');

    it('render empty parameters', async () => {
        givenComponent({});

        await Alpine.nextTick(() => {
            const pagination = screen.getByTestId('pagination', {});

            expect(document.querySelector('nav')).not.toBeVisible();
            expect(getPrev(pagination).tagName).toEqual('SPAN');
            expect(getNext(pagination).tagName).toEqual('SPAN');
            expect(getPages(pagination)).toEqual([]);
        });
    });

    it('render perPage is 10 and total is 5', async () => {
        givenComponent({ current_page: 1, per_page: 10, total: 5 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByTestId('pagination', {});

            expect((document.querySelector('nav').classList.contains('flex'))).toBeTruthy();
            expect(getPrev(pagination).tagName).toEqual('SPAN');
            expect(getNext(pagination).tagName).toEqual('SPAN');
            expect(getPages(pagination)).toEqual([1]);
        });
    });

    it('render perPage is 10 and total is 10000', async () => {
        givenComponent({ current_page: 500, per_page: 10, total: 10000 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByTestId('pagination', {});

            expect(getPrev(pagination).tagName).toEqual('A');
            expect(getNext(pagination).tagName).toEqual('A');
            expect(getPages(pagination)).toEqual([1, 2, 497, 498, 499, 500, 501, 502, 503, 999, 1000]);
        });
    });

    it('current_page is first page', async () => {
        givenComponent({ current_page: 1, per_page: 10, total: 100 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByTestId('pagination', {});

            expect(getPrev(pagination).tagName).toEqual('SPAN');
            expect(getNext(pagination).tagName).toEqual('A');
            expect(getPages(pagination)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    it('current_page is last page', async () => {
        givenComponent({ current_page: 10, per_page: 10, total: 100 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByTestId('pagination', {});

            expect(getPrev(pagination).tagName).toEqual('A');
            expect(getNext(pagination).tagName).toEqual('SPAN');
            expect(getPages(pagination)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    it('current_page is 5 of 10', async () => {
        givenComponent({ current_page: 5, per_page: 10, total: 100 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByTestId('pagination', {});

            expect(getPrev(pagination).tagName).toEqual('A');
            expect(getNext(pagination).tagName).toEqual('A');
            expect(getPages(pagination)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    it('fire page change', async () => {
        const component = givenComponent({ current_page: 500, per_page: 10, total: 10000 });

        let detail;
        component.addEventListener('change', (e) => (detail = e.detail));

        await Alpine.nextTick(async () => {
            const pagination = screen.getByTestId('pagination', {});
            fireEvent.click(getPrev(pagination));
            await waitFor(() => expect(detail).toEqual(499));
        });
    });

    it('render bootstrap5', async () => {
        givenComponent({ current_page: 1, per_page: 10, total: 5, theme: 'bootstrap5' });

        await Alpine.nextTick(() => {
            const pagination = screen.getByTestId('pagination', {});

            expect((document.querySelector('nav').classList.contains('d-flex'))).toBeTruthy();
            expect(getPrev(pagination).tagName).toEqual('SPAN');
            expect(getNext(pagination).tagName).toEqual('SPAN');
            expect(getPages(pagination)).toEqual([1]);
        });
    });
});