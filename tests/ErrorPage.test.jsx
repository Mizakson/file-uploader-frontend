import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Link } from 'react-router-dom'
import { vi } from 'vitest'
import ErrorPage from '../src/pages/ErrorPage'

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Link: vi.fn(({ to, children }) => <a href={to}>{children}</a>),
    }
})

describe('ErrorPage', () => {

    const setupRender = () => {
        render(
            <BrowserRouter>
                <ErrorPage />
            </BrowserRouter>
        )
    }

    it('should render the correct heading and the home link with the correct path', () => {
        setupRender()

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            /Error: this route doesn't exist.../i
        )

        const homeLink = screen.getByRole('link', { name: /Go back home/i })

        expect(homeLink).toBeInTheDocument()

        expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should have the correct class name on the container', () => {
        setupRender()

        const container = screen.getByRole('heading', { level: 1 }).closest('div')

        expect(container).toHaveClass('error-page-container')
    })
})