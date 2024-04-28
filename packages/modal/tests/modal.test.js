import Alpine from 'alpinejs';
import plugin from '../src';
import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/dom';

describe('Alpine $modal', () => {
    beforeAll(() => {
        plugin(Alpine);
        Alpine.start();
    });

    afterAll(() => Alpine.stopObservingMutations());

    it('show', async () => {
        Alpine.$alert('');
        const dialog = await screen.findByRole('dialog', {});
        expect(dialog).toBeInTheDocument();
    });

    it('close', async () => {
        Alpine.$alert('');
        fireEvent.click(await screen.findByRole('button', { name: /ok/i }));
        await waitForElementToBeRemoved(() => screen.queryByRole('dialog', {}));
    });

    it('set message', async () => {
        async function shouldBe(message) {
            Alpine.$alert(message);
            await Alpine.nextTick(async () => {
                const dialog = await screen.findByRole('dialog', {});
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
                const dialog = await screen.findByRole('dialog', {});
                expect(dialog.querySelector('[x-html=title]').innerHTML).toEqual(title);
            });
        }

        await shouldBe('foo');
        await shouldBe('bar');
    });

    it('hide close button', async () => {
        Alpine.$modal.show({ showCloseButton: false });
        await Alpine.nextTick(async () => {
            const dialog = await screen.findByRole('dialog', {});
            await waitFor(() => expect(dialog.querySelector('[x-show=showCloseButton]')).not.toBeVisible());
        });
    });

    it('show close button', async () => {
        Alpine.$modal.show({ showCloseButton: true });
        await Alpine.nextTick(async () => {
            const dialog = await screen.findByRole('dialog', {});
            await waitFor(() => expect(dialog.querySelector('[x-show=showCloseButton]')).toBeVisible());
        });
    });

    describe('$alert', () => {
        it('alert ok', async () => {
            const result = Alpine.$alert('something went wrong');
            await Alpine.nextTick(async () => {
                fireEvent.click(await screen.findByRole('button', { name: /ok/i }));
                await waitFor(async () => expect(await result).toBeFalsy());
            });
            await waitForElementToBeRemoved(() => screen.queryByRole('dialog', {}));
        });
    });

    describe('$confirm', () => {
        it('confirm ok', async () => {
            const result = Alpine.$confirm('are you sure?');
            await Alpine.nextTick(async () => {
                fireEvent.click(await screen.findByRole('button', { name: /ok/i }));
                await waitFor(async () => expect(await result).toBeTruthy());
            });
            await waitForElementToBeRemoved(() => screen.queryByRole('dialog', {}));
        });

        it('confirm cancel', async () => {
            const result = Alpine.$confirm('are you sure?');
            await Alpine.nextTick(async () => {
                fireEvent.click(await screen.findByRole('button', { name: /cancel/i }));
                await waitFor(async () => expect(await result).toBeFalsy());
            });
            await waitForElementToBeRemoved(() => screen.queryByRole('dialog', {}));
        });
    });

    describe('$prompt', () => {
        it('prompt ok', async () => {
            const result = Alpine.$prompt('are you sure?');
            await Alpine.nextTick(async () => {
                const dialog = await screen.findByRole('dialog', {});
                const input = dialog.querySelector('input');
                input._x_model.set('foo');
                fireEvent.click(await screen.findByRole('button', { name: /ok/i }));
                await waitFor(async () => expect(await result).toEqual('foo'));
            });
            await waitForElementToBeRemoved(() => screen.queryByRole('dialog', {}));
        });

        it('prompt cancel', async () => {
            const result = Alpine.$prompt('are you sure?');
            await Alpine.nextTick(async () => {
                const dialog = await screen.findByRole('dialog', {});
                const input = dialog.querySelector('input');
                input._x_model.set('foo');
                fireEvent.click(await screen.findByRole('button', { name: /cancel/i }));
                await waitFor(async () => expect(await result).toBeFalsy);
            });
            await waitForElementToBeRemoved(() => screen.queryByRole('dialog', {}));
        });

        it('prompt input invalid', async () => {
            Alpine.$prompt('are you sure?');
            const dialog = await screen.findByRole('dialog', {});
            const input = dialog.querySelector('input');
            fireEvent.click(await screen.findByRole('button', { name: /ok/i }));
            await waitFor(() => expect(input.className).toContain('text-red-900'));
        });
    });
});