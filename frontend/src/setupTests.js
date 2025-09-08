import '@testing-library/jest-dom'

// mock window.dispatchEvent for navigate events used in Header
window.dispatchEvent = window.dispatchEvent || ((e) => { })

// mock getComputedStyle if needed
window.getComputedStyle = window.getComputedStyle || (() => ({ getPropertyValue: () => '' }))
