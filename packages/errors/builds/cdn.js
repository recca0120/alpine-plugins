import errors from '../src'

document.addEventListener('alpine:init', () => {
    window.Alpine.plugin(errors)
})