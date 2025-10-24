import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import AddFolder from '../src/pages/AddFolder'

// Mocks
const mockUser = { id: 456, name: 'Test User' }
const mockNavigate = vi.fn()
const mockToken = 'test-auth-token-123'
const mockApiUrl = 'http://test-api.com'

vi.stubGlobal('localStorage', {
    getItem: (key) => {
        if (key === 'token') return mockToken
        return null
    }
})

vi.stubEnv('VITE_API_URL', mockApiUrl)

vi.mock('react-router-dom', () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    useNavigate: () => mockNavigate,
}))

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ user: mockUser }),
}))

let fetchSpy


beforeEach(() => {
    vi.clearAllMocks()

    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Folder added successfully' }),
    })
})

afterEach(() => {
    fetchSpy.mockRestore()
})

const setupRender = () => {
    const user = userEvent.setup()
    render(<AddFolder />)
    return { user }
}


// Tests

describe('AddFolder', () => {

    it('should render the form elements and initial state', () => {
        setupRender()

        expect(screen.getByRole('heading', { level: 1, name: /Add folder/i })).toBeInTheDocument()

        expect(screen.getByLabelText(/Folder Name/i)).toBeInTheDocument()

        expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/')

        expect(screen.getByRole('button', { name: '+' })).not.toBeDisabled()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should update folderName state on input change', async () => {
        const { user } = setupRender()
        const input = screen.getByLabelText(/Folder Name/i)
        const testName = "My New Project"

        await user.type(input, testName)

        expect(input).toHaveValue(testName)
    })

    it('should call API, navigate to home on success, and clear loading state', async () => {
        const { user } = setupRender()
        const input = screen.getByLabelText(/Folder Name/i)
        const submitButton = screen.getByRole('button', { name: '+' })
        const folderName = "Documents"

        await user.type(input, folderName)

        await act(async () => {
            await user.click(submitButton)
        })

        expect(fetchSpy).toHaveBeenCalledTimes(1)
        expect(fetchSpy).toHaveBeenCalledWith(
            `${mockApiUrl}/api/content/add-folder`,
            expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${mockToken}`
                },
                body: JSON.stringify({ newFolder: folderName })
            })
        )

        expect(mockNavigate).toHaveBeenCalledWith('/')

        expect(submitButton).toHaveTextContent('+')
    })

    it('should display server error message on API failure', async () => {
        const customErrorMessage = 'Folder name already exists.'

        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: customErrorMessage }),
        })

        const { user } = setupRender()
        const input = screen.getByLabelText(/Folder Name/i)
        const submitButton = screen.getByRole('button', { name: '+' })

        await user.type(input, 'Bad Folder')

        await act(async () => {
            await user.click(submitButton)
        })

        const errorMessage = screen.getByText(customErrorMessage)
        expect(errorMessage).toBeInTheDocument()

        expect(errorMessage).toHaveStyle({ color: 'rgb(255, 0, 0)' })

        expect(submitButton).toHaveTextContent('+')
        expect(submitButton).not.toBeDisabled()

        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should display a generic error message if server response cannot be parsed', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 503,
            json: async () => { throw new Error('Not JSON') },
        })

        const { user } = setupRender()
        const input = screen.getByLabelText(/Folder Name/i)
        const submitButton = screen.getByRole('button', { name: '+' })

        await user.type(input, 'Bad Folder')

        await act(async () => {
            await user.click(submitButton)
        })

        const expectedErrorText = 'HTTP Error, status: 503'

        expect(screen.getByText(expectedErrorText)).toBeInTheDocument()

        expect(submitButton).toHaveTextContent('+')
    })

    it('should disable input and submit button and update button text when loading is true', async () => {
        fetchSpy.mockReturnValue(new Promise(() => { }))

        const { user } = setupRender()
        const input = screen.getByLabelText(/Folder Name/i)
        const submitButton = screen.getByRole('button', { name: '+' })

        await user.type(input, 'Test Folder')

        await user.click(submitButton)

        await waitFor(() => {
            expect(submitButton).toBeDisabled()
            expect(submitButton).toHaveTextContent('Adding folder...')
        }, { timeout: 50 })

        expect(input).toBeDisabled()
    })
})
