import { fireEvent, screen } from '@testing-library/dom';
import he from 'he';
import Alpine from 'alpinejs';
import plugin, { bootstrap5 } from '../src';

describe('Alpine pagination directive', () => {
    const emptyFn = () => {
    };

    const encode = (text) => {
        return he.encode(text, { 'useNamedReferences': true, 'decimal': true });
    };

    const getPages = pagination => Array.from(pagination.querySelectorAll('nav a[x-text="page"]'))
        .map((el) => el.textContent.trim())
        .map((text) => parseInt(text, 10))
        .filter((num) => num);

    const getPrevOrNext = (pagination, filters) => {
        return Array.from(pagination.querySelectorAll('nav *'))
            .filter((el) => filters.some((f) => RegExp(f, 'i').test(encode(el.textContent.trim()))))
            .filter((el) => el._x_isShown)
            .map((el) => el.firstElementChild ? el.firstElementChild : el)[0];
    };

    const getPrev = (pagination) => getPrevOrNext(pagination, ['&laquo;', 'Previous']);
    const getNext = (pagination) => getPrevOrNext(pagination, ['Next', '&raquo;']);

    const givenComponent = (options, callback = emptyFn) => {
        const component = document.createElement('div');
        component.innerHTML = `
            <div x-data='{ pagination: ${JSON.stringify(options)} }'>
                <div x-pagination='pagination' role="pagination"/>
            </div>
        `;
        component.addEventListener('change', callback);
        document.body.append(component);
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
            const pagination = screen.getByRole('pagination');

            expect(document.querySelector('nav').style.display).toEqual('none');
            expect(getPrev(pagination).tagName).toEqual('SPAN');
            expect(getNext(pagination).tagName).toEqual('SPAN');
            expect(getPages(pagination)).toEqual([]);
        });
    });

    it('render perPage is 10 and total is 5', async () => {
        givenComponent({ current_page: 1, per_page: 10, total: 5 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByRole('pagination');

            expect((document.querySelector('nav').classList.contains('flex'))).toBeTruthy();
            expect(getPrev(pagination).tagName).toEqual('SPAN');
            expect(getNext(pagination).tagName).toEqual('SPAN');
            expect(getPages(pagination)).toEqual([1]);
        });
    });

    it('render perPage is 10 and total is 10000', async () => {
        givenComponent({ current_page: 500, per_page: 10, total: 10000 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByRole('pagination');

            expect(getPrev(pagination).tagName).toEqual('A');
            expect(getNext(pagination).tagName).toEqual('A');
            expect(getPages(pagination)).toEqual([1, 2, 497, 498, 499, 500, 501, 502, 503, 999, 1000]);
        });
    });

    it('current_page is first page', async () => {
        givenComponent({ current_page: 1, per_page: 10, total: 100 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByRole('pagination');

            expect(getPrev(pagination).tagName).toEqual('SPAN');
            expect(getNext(pagination).tagName).toEqual('A');
            expect(getPages(pagination)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    it('current_page is last page', async () => {
        givenComponent({ current_page: 10, per_page: 10, total: 100 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByRole('pagination');

            expect(getPrev(pagination).tagName).toEqual('A');
            expect(getNext(pagination).tagName).toEqual('SPAN');
            expect(getPages(pagination)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    it('current_page is 5 of 10', async () => {
        givenComponent({ current_page: 5, per_page: 10, total: 100 });

        await Alpine.nextTick(() => {
            const pagination = screen.getByRole('pagination');

            expect(getPrev(pagination).tagName).toEqual('A');
            expect(getNext(pagination).tagName).toEqual('A');
            expect(getPages(pagination)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    it('fire page change', (done) => {
        givenComponent({ current_page: 500, per_page: 10, total: 10000 }, (e) => {
            expect(e.detail).toEqual(499);
            done();
        });

        Alpine.nextTick(() => {
            const pagination = screen.getByRole('pagination');

            fireEvent.click(getPrev(pagination));
        });
    });

    it('render bootstrap5', async () => {
        givenComponent({ current_page: 1, per_page: 10, total: 5, theme: 'bootstrap5' });

        await Alpine.nextTick(() => {
            const pagination = screen.getByRole('pagination');

            expect((document.querySelector('nav').classList.contains('d-flex'))).toBeTruthy();
            expect(getPrev(pagination).tagName).toEqual('SPAN');
            expect(getNext(pagination).tagName).toEqual('SPAN');
            expect(getPages(pagination)).toEqual([1]);
        });
    });
});