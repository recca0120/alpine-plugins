import Alpine from 'alpinejs';
import plugin from '../src/index.js';
import { fireEvent, screen } from '@testing-library/dom';

describe('Alpine $modal', () => {
    beforeAll(() => {
        plugin(Alpine);
        Alpine.start();
    });

    afterAll(() => Alpine.stopObservingMutations());

    it('show', async () => {
        Alpine.$alert('');
        await Alpine.nextTick(() => {
            const dialog = screen.queryByRole('dialog');
            expect(dialog.style.display).toEqual('');
        });
    });

    it('close', (done) => {
        Alpine.$alert('');
        Alpine.nextTick(async () => {
            const dialog = screen.queryByRole('dialog');
            expect(dialog.style.display).toEqual('');

            fireEvent.click(dialog.querySelector('button'));
            setTimeout(() => {
                expect(dialog.style.display).toEqual('none');
                done();
            }, 200);
        });
    });

    it('set message', async () => {
        async function shouldBe(message) {
            Alpine.$alert(message);
            await Alpine.nextTick(async () => {
                const dialog = screen.queryByRole('dialog');
                expect(dialog.querySelector('[x-html=message]').innerHTML).toEqual(message);
            });
        }

        await shouldBe('foo');
        await shouldBe('bar');
    });

    it('set title', async () => {
        async function shouldBe(title) {
            Alpine.$alert('hello world', {title});
            await Alpine.nextTick(async () => {
                const dialog = screen.queryByRole('dialog');
                expect(dialog.querySelector('[x-html=title]').innerHTML).toEqual(title);
            });
        }

        await shouldBe('foo');
        await shouldBe('bar');
    });

    describe('$confirm', () => {
        it('ok', async () => {
            const promise = Alpine.$confirm('are you sure?');
            await Alpine.nextTick(async () => {
                fireEvent.click(screen.queryByText('Ok'));
                expect(await promise).toBeTruthy();
            });
        });

        it('cancel', async () => {
            const promise = Alpine.$confirm('are you sure?');
            await Alpine.nextTick(async () => {
                fireEvent.click(screen.queryByText('Cancel'));
                expect(await promise).toBeFalsy();
            });
        });
    });

    describe('$prompt', () => {
        it('get prompt', async () => {
            const promise = Alpine.$prompt('input your name.');
            await Alpine.nextTick(async () => {
                const input = document.querySelector('input');
                input._x_model.set('foo');
                fireEvent.click(screen.queryByText('Ok'));
                expect(await promise).toEqual('foo');
            });
        });

        it('cancel', async () => {
            const promise = Alpine.$prompt('input your name.');
            await Alpine.nextTick(async () => {
                const input = document.querySelector('input');
                input._x_model.set('foo');
                fireEvent.click(screen.queryByText('Cancel'));
                expect(await promise).toEqual(false);
            });
        });
    });
});