import pagination from '../src';

document.addEventListener('alpine:init', () => {
    window.Alpine.plugin(pagination);
});