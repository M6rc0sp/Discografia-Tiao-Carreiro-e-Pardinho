import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ManageSuggestions from '../ManageSuggestions'

vi.mock('../../api', () => {
    return {
        api: {
            get: vi.fn(() => Promise.resolve({ data: [] })),
            post: vi.fn(() => Promise.reject({ response: { status: 500, data: { message: 'Server error' } } })),
            put: vi.fn(() => Promise.resolve({ data: {} })),
            delete: vi.fn(() => Promise.resolve({ data: {} })),
        },
        getCurrentUser: vi.fn(() => Promise.resolve({ id: 1, name: 'Test' })),
        getCsrf: vi.fn(() => Promise.resolve(true)),
        attachXsrfHeaders: vi.fn(h => h),
    }
})

describe('ManageSuggestions create error', () => {
    test('shows error when create song API returns 500', async () => {
        render(<ManageSuggestions />)
        const manageTab = screen.getByText('Gerenciar')
        fireEvent.click(manageTab)
        await waitFor(() => expect(screen.getByText('Gerenciar músicas')).toBeInTheDocument())
        const input = screen.getAllByPlaceholderText('Link do YouTube')[0]
        const add = screen.getByText('Adicionar')
        fireEvent.change(input, { target: { value: 'https://youtu.be/abc' } })
        fireEvent.click(add)
        // API returns 'Server error' in mock, UI should display that message
        await waitFor(() => expect(screen.getByText('Server error')).toBeInTheDocument())
    })
})
