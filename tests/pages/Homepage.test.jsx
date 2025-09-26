import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import Homepage from '../../src/pages/Homepage'

const setUpRender = () => {
    render(
        <BrowserRouter>
            <Homepage />
        </BrowserRouter>
    )
}

describe('Homepage render test', () => {
    beforeEach(setUpRender)

    it('should render all elements correctly', () => {
        // File Uploader h1 tag 
        // Sign Up button with link to 'sign-up'
        // Login button with link to 'login'

        expect(screen.getByRole('heading', { name: /File Uploader/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
    })
})

describe('Homepage button navigation test', () => {
    beforeEach(setUpRender)

    // link tag is nested within button
    it('should go to sign-up page when sign-up button is clicked', () => {
        const signUpLink = screen.getByRole('link', { name: /Sign Up/i })

        expect(signUpLink).toBeInTheDocument()
        expect(signUpLink).toHaveAttribute('href', '/sign-up')
    })


    it('should navigate to login page when login button is clicked', () => {
        const loginLink = screen.getByRole('link', { name: /Login/i })

        expect(loginLink).toBeInTheDocument()
        expect(loginLink).toHaveAttribute('href', '/login')
    })
})