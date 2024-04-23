import Alpine from 'alpinejs';
import plugin from '..';
import { fireEvent, screen } from '@testing-library/dom';

describe('Alpine $modal', () => {
    const delay = (timeout) => {
        return new Promise((resolve) => setTimeout(() => resolve(), timeout));
    };
    beforeAll(() => {
        plugin(Alpine);
        Alpine.start();
    });

    afterAll(() => Alpine.stopObservingMutations());

    it('show', async () => {
        Alpine.$alert();
        await Alpine.nextTick(() => {
            const dialog = screen.queryByRole('dialog');
            expect(dialog.style.display).toEqual('');
        });
    });

    it('close', async () => {
        Alpine.$alert();
        await Alpine.nextTick(async () => {
            const dialog = screen.queryByRole('dialog');
            expect(dialog.style.display).toEqual('');

            fireEvent.click(dialog.querySelector('button'));
            await delay(200);
            expect(dialog.style.display).toEqual('none');
        });
    });
});