import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import Login from '../src/pages/Login'
import { useAuth } from '../src/contexts/AuthContext'

const setupRender = () => {
    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    )
}

describe("Login page render test", () => {
    beforeEach(setupRender)

    it("should render all elements correctly", () => {

        expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument()
        expect(screen.getByLabelText("Username:")).toBeInTheDocument()
        expect(screen.getByLabelText("Password:")).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
    })
})


import.meta.env.VITE_API_URL = 'http://test-api.com'

global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
            message: "User logged in",
            token: "Bearer mock-test-token-string",
            user: { id: 1, username: "TestUser" }
        }),
    })
)

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

const mockLogin = vi.fn()

vi.mock('/src/contexts/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}))

describe('Login page submission and navigation test', () => {
    let user

    beforeEach(() => {
        setupRender()
        user = userEvent.setup()
        mockLogin.mockClear()
    })

    it('should submit form successfully and navigate to profile page', async () => {
        const usernameInput = screen.getByLabelText("Username:");
        const passwordInput = screen.getByLabelText("Password:");
        const loginButton = screen.getByRole('button', { name: /Login/i });

        await user.type(usernameInput, 'TestUser')
        await user.type(passwordInput, 'password123')

        await user.click(loginButton)

        await vi.waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                `${import.meta.env.VITE_API_URL}/api/login`,
                expect.objectContaining({
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: 'TestUser', password: 'password123' })
                })
            )
        })

        await vi.waitFor(() => {
            expect(mockLogin).toHaveBeenCalledTimes(1)
        })

        await vi.waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(
                { id: 1, username: 'TestUser' }
            )
        })

        await vi.waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/')
        })

    })
})
