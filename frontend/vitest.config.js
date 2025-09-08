import { defineConfig } from 'vitest/config'

// Vitest config to ensure globals and jsdom environment are always used
export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js'
    }
})
