import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import SignUp from '../src/pages/SignUp'

const setupRender = () => {
    render(
        <BrowserRouter>
            <SignUp />
        </BrowserRouter>
    )
}

describe('Sign Up component render test', () => {
    beforeEach(setupRender)

    it('should render all elements correctly', () => {

        expect(screen.getByRole('heading', { name: /Sign Up/i })).toBeInTheDocument()
        expect(screen.getByLabelText("Username:")).toBeInTheDocument()
        expect(screen.getByLabelText("Password:")).toBeInTheDocument()
        expect(screen.getByLabelText("Confirm Password:")).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument()
    })
})

describe('Sign up component password validation tests', () => {
    let user

    beforeEach(() => {
        setupRender()
        user = userEvent.setup()
    })

    it('should display an error when passwords do not match', async () => {
        const passwordInput = screen.getByLabelText("Password:")
        const confirmPasswordInput = screen.getByLabelText("Confirm Password:")
        const signUpButton = screen.getByRole('button', { name: /Sign Up/i })

        await user.type(passwordInput, 'password123')
        await user.type(confirmPasswordInput, 'NotMatchingPassword')

        await user.click(signUpButton)

        expect(screen.getByText(/Passwords do not match./i)).toBeInTheDocument()
    })

    it('should display an error when the password is less than 6 characters long', async () => {
        const passwordInput = screen.getByLabelText("Password:")
        const confirmPasswordInput = screen.getByLabelText("Confirm Password:")
        const signUpButton = screen.getByRole('button', { name: /Sign Up/i })

        await user.type(passwordInput, 'passw')
        await user.type(confirmPasswordInput, 'passw')

        await user.click(signUpButton)

        expect(screen.getByText(/Password length must be at least 6 characters./i)).toBeInTheDocument()
    })
})