import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ManageSuggestions from '../ManageSuggestions'

vi.mock('../../api', () => {
    return {
        api: {
            get: vi.fn(() => Promise.resolve({ data: [] })),
            post: vi.fn(() => Promise.resolve({ data: {} })),
            put: vi.fn(() => Promise.resolve({ data: {} })),
            delete: vi.fn(() => Promise.resolve({ data: {} })),
        },
        getCurrentUser: vi.fn(() => Promise.resolve({ id: 1, name: 'Test' })),
        getCsrf: vi.fn(() => Promise.resolve(true)),
        attachXsrfHeaders: vi.fn(h => h),
    }
})

describe('ManageSuggestions modal', () => {
    test('modal validation blocks empty youtube_link on save', async () => {
        // make the songs endpoint return a single song before rendering
        const mod = await import('../../api')
        mod.api.get.mockImplementation((url) => {
            if (url === '/songs') return Promise.resolve({ data: { top: [{ id: 1, title: 'T', youtube_link: 'https://youtu.be/abc' }], rest: [] } })
            return Promise.resolve({ data: [] })
        })

        render(<ManageSuggestions />)
        const manageTab = screen.getByText('Gerenciar')
        fireEvent.click(manageTab)

        await waitFor(() => expect(screen.getByText('Gerenciar músicas')).toBeInTheDocument())

        // wait for the Edit button to appear and click it
        await waitFor(() => expect(screen.getByText('Editar')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Editar'))

        // modal should open
        await waitFor(() => expect(screen.getByText('Editar música')).toBeInTheDocument())

        // clear the youtube_link field and click Salvar
        const linkInput = screen.getByLabelText('Link do YouTube')
        fireEvent.change(linkInput, { target: { value: '' } })
        fireEvent.click(screen.getByText('Salvar'))

        // helper text should show validation
        await waitFor(() => expect(screen.getByText('Link do YouTube é obrigatório')).toBeInTheDocument())
    })
})
