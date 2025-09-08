import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../Header'

describe('Header', () => {
    test('shows Entrar when no user and not on login page', () => {
        render(<Header user={null} onLogout={() => { }} page={'home'} />)
        expect(screen.getByText('Entrar')).toBeInTheDocument()
    })

    test('shows only Sair on manage page when logged in', () => {
        const user = { name: 'Admin' }
        render(<Header user={user} onLogout={() => { }} page={'manage'} />)
        expect(screen.queryByText('Gerenciar')).not.toBeInTheDocument()
        expect(screen.getByText('Sair')).toBeInTheDocument()
    })
})
