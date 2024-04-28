import modal from '../src';

document.addEventListener('alpine:init', () => {
    window.Alpine.plugin(modal);
});