import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import Login from '../src/pages/Login'

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