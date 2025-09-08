import React from 'react'
import { render, screen } from '@testing-library/react'
import Songs from '../Songs'

// basic smoke test to ensure component renders without crashing
describe('Songs', () => {
    test('renders suggestion form and headings', () => {
        render(<Songs />)
        expect(screen.getByText('Sugerir Nova Música')).toBeInTheDocument()
        expect(screen.getByText('Ranking Atual')).toBeInTheDocument()
    })
})
