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