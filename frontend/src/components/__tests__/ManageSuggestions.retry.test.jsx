import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ManageSuggestions from '../ManageSuggestions'

vi.mock('../../api', () => {
    return {
        api: { get: vi.fn(), post: vi.fn() },
        getCurrentUser: vi.fn(() => Promise.resolve({ id: 1, name: 'Test' })),
        getCsrf: vi.fn(() => Promise.resolve(true)),
        attachXsrfHeaders: vi.fn(h => h),
    }
})

describe('ManageSuggestions retry behavior', () => {
    test('approve retries on 419 then succeeds', async () => {
        const mod = await import('../../api')
        mod.api.get.mockImplementationOnce(() => Promise.resolve({ data: [{ id: 1, title: 'S1', youtube_link: 'https://youtu.be/abc' }] }))
        // first post returns 419 error, second resolves
        mod.api.post.mockImplementationOnce(() => Promise.reject({ response: { status: 419 } }))
        mod.api.post.mockImplementationOnce(() => Promise.resolve({ data: {} }))

        render(<ManageSuggestions />)
        await waitFor(() => expect(screen.getByText('S1')).toBeInTheDocument())
        fireEvent.click(screen.getAllByText('Aprovar')[0])
        await waitFor(() => expect(mod.api.post).toHaveBeenCalledTimes(2))
    })

    test('approve redirects to login on 401', async () => {
        const mod = await import('../../api')
        mod.api.get.mockImplementationOnce(() => Promise.resolve({ data: [{ id: 2, title: 'S2', youtube_link: 'https://youtu.be/def' }] }))
        mod.api.post.mockImplementationOnce(() => Promise.reject({ response: { status: 401 } }))

        const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
        render(<ManageSuggestions />)
        await waitFor(() => expect(screen.getByText('S2')).toBeInTheDocument())
        fireEvent.click(screen.getAllByText('Aprovar')[0])
        await waitFor(() => expect(dispatchSpy).toHaveBeenCalled())
    })
})
