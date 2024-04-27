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
            shouldBeDisplayed(dialog);
        });
    });

    it('close', async () => {
        Alpine.$alert('');
        let dialog;
        await Alpine.nextTick(async () => {
            dialog = screen.queryByRole('dialog');
            shouldBeDisplayed(dialog);

            fireEvent.click(dialog.querySelector('button'));
        });
        await delay(350);
        shouldBeHidden(dialog);
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
            Alpine.$alert('hello world', { title });
            await Alpine.nextTick(async () => {
                const dialog = screen.queryByRole('dialog');
                expect(dialog.querySelector('[x-html=title]').innerHTML).toEqual(title);
            });
        }

        await shouldBe('foo');
    });
    it('show close button', async () => {
        Alpine.$modal.show({ showCloseButton: true });
        await Alpine.nextTick(async () => {
            const dialog = screen.queryByRole('dialog');
            await delay(400);
            shouldBeDisplayed(dialog.querySelector('[x-show=showCloseButton]'));
        });
    });

    describe('$alert', () => {
        it('alert ok', async () => {
            const promise = Alpine.$alert('something went wrong');
            await Alpine.nextTick(async () => {
                fireEvent.click(screen.queryByText('Ok'));
            });

            await Alpine.nextTick(async () => {
                expect(await promise).toBeFalsy();
            });
        });
    });

    describe('$confirm', () => {
        it('confirm ok', async () => {
            const promise = Alpine.$confirm('are you sure?');
            await Alpine.nextTick(() => {
                fireEvent.click(screen.queryByText('Ok'));
            });

            await Alpine.nextTick(async () => {
                expect(await promise).toBeTruthy();
            });
        });

        it('confirm cancel', async () => {
            const promise = Alpine.$confirm('are you sure?');
            await Alpine.nextTick(() => {
                fireEvent.click(screen.queryByText('Cancel'));
            });
            await Alpine.nextTick(async () => {
                expect(await promise).toBeFalsy();
            });
        });
    });

    describe('$prompt', () => {
        it('prompt ok', async () => {
            const promise = Alpine.$prompt('are you sure?');
            await Alpine.nextTick(() => {
                const dialog = screen.queryByRole('dialog');
                const input = dialog.querySelector('input');
                input._x_model.set('foo');
                fireEvent.click(screen.queryByText('Ok'));
            });
            await Alpine.nextTick(async () => {
                await delay(350);
                expect(await promise).toEqual('foo');
            });
        });

        it('prompt cancel', async () => {
            const promise = Alpine.$prompt('are you sure?');
            await Alpine.nextTick(() => {
                const dialog = screen.queryByRole('dialog');
                const input = dialog.querySelector('input');
                input._x_model.set('foo');
                fireEvent.click(screen.queryByText('Cancel'));
            });

            await Alpine.nextTick(async () => {
                await delay(350);
                expect(await promise).toBeFalsy();
            });
        });

        it('prompt input invalid', async () => {
            const promise = Alpine.$prompt('are you sure?');
            await Alpine.nextTick(() => {
                fireEvent.click(screen.queryByText('Ok'));
            });
            await Alpine.nextTick(async () => {
                const input = document.querySelector('input');
                expect(input.className).toContain('text-red-900');
            });
        });
    });

    const delay = (timeout) => {
        return new Promise((resolve) => setTimeout(resolve, timeout));
    };

    const shouldBeDisplayed = element => {
        expect(element.style.display).toEqual('');
    };

    const shouldBeHidden = element => {
        expect(element.style.display).toEqual('none');
    };
});