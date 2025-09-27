import '@testing-library/jest-dom/vitest'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Homepage from '../../src/pages/Homepage'

const setupRender = () => {
    render(
        <BrowserRouter>
            <Homepage />
        </BrowserRouter>
    )
}

describe('Homepage element render test', () => {
    beforeEach(setupRender)

    it('should render all elements correctly', () => {
        // h1 text  - File Uploader
        // button   - Sign Up
        // button   - Login

        expect(screen.getByRole('heading', { name: /File Uploader/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
    })
})

describe('Homepage link element test', () => {
    beforeEach(setupRender)

    it('buttons should have link that leads to correct path', () => {
        // sign up button - /sign-up
        // login button   - /login

        const signUpLink = screen.getByRole('link', { name: /Sign Up/i })
        const loginLink = screen.getByRole('link', { name: /Login/i })

        expect(signUpLink).toBeInTheDocument()
        expect(loginLink).toBeInTheDocument()

        expect(signUpLink).toHaveAttribute('href', '/sign-up')
        expect(loginLink).toHaveAttribute('href', '/login')
    })
})