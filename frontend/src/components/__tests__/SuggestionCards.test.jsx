import React from 'react'
import { render, screen } from '@testing-library/react'
import SuggestionCards from '../SuggestionCards'

const items = [
    { id: 1, title: 'Song 1', youtube_link: 'https://youtu.be/abc' },
    { id: 2, title: 'Song 2', youtube_link: 'https://youtu.be/def' },
]

describe('SuggestionCards', () => {
    test('renders list and actions', () => {
        render(<SuggestionCards items={items} onApprove={() => { }} onReject={() => { }} showActions={true} />)
        expect(screen.getByText('Song 1')).toBeInTheDocument()
        // there may be multiple 'Aprovar' buttons (one per card) — assert at least one exists
        expect(screen.getAllByText('Aprovar').length).toBeGreaterThan(0)
    })

    test('renders restore button when showActions is false', () => {
        render(<SuggestionCards items={items} onRestore={() => { }} showActions={false} />)
        // multiple 'Restaurar' buttons possible — ensure at least one is rendered
        expect(screen.getAllByText('Restaurar').length).toBeGreaterThan(0)
    })
})
