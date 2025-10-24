import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mocks

const mockUser = { id: 456, name: 'Test User' }
const mockNavigate = vi.fn()
const mockTriggerDataRefresh = vi.fn()
const mockToken = 'test-auth-token-123'
const mockApiUrl = 'http://test-api.com'
const mockFolderId = 'fld-789-xyz'
const initialFolderName = 'My Old Folder Name'
const newFolderName = 'My Renamed Folder'

vi.stubGlobal('localStorage', {
    getItem: (key) => {
        if (key === 'token') return mockToken
        return null
    }
})

vi.stubEnv('VITE_API_URL', mockApiUrl)

import EditFolder from '../src/pages/EditFolder'

vi.mock('react-router-dom', () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    useNavigate: () => mockNavigate,
    useParams: () => ({ folderId: mockFolderId }),
}))

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        triggerDataRefresh: mockTriggerDataRefresh
    }),
}))

let fetchSpy

const getPostUrl = `${mockApiUrl}/api/content/${mockFolderId}/edit-folder`

beforeEach(() => {
    vi.clearAllMocks()

    fetchSpy = vi.spyOn(global, 'fetch')
})

afterEach(() => {
    fetchSpy.mockRestore()
})

const setupRender = () => {
    const user = userEvent.setup()
    render(<EditFolder />)
    return { user }
}


// Tests

describe('EditFolder', () => {

    it('should fetch the folder name on initial load and populate the form', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ folder: { name: initialFolderName } }),
        })

        setupRender()

        expect(fetchSpy).toHaveBeenCalledWith(
            getPostUrl,
            expect.objectContaining({
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${mockToken}`
                },
            })
        )

        const heading = await screen.findByRole('heading', { name: `Edit folder ${initialFolderName}` })
        expect(heading).toBeInTheDocument()

        const input = screen.getByLabelText(/Folder Name/i)
        expect(input).toHaveValue(initialFolderName)

        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should display an error message if the initial GET fetch fails', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'Folder not found' }),
        })

        setupRender()

        expect(fetchSpy).toHaveBeenCalledTimes(1)

        const errorMessage = await screen.findByText('Failed to load current folder name.')
        expect(errorMessage).toBeInTheDocument()

        const input = screen.getByLabelText(/Folder Name/i)
        expect(input).toHaveValue("")
        expect(input).toHaveAttribute('placeholder', 'Enter new name')
    })

    it('should update folderName state on input change', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ folder: { name: initialFolderName } }),
        })

        const { user } = setupRender()

        const input = await screen.findByLabelText(/Folder Name/i)

        await user.clear(input)
        await user.type(input, newFolderName)

        expect(input).toHaveValue(newFolderName)
    })

    it('should call API with new name, trigger data refresh, navigate to home, and clear loading state', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ folder: { name: initialFolderName } }),
        })

        const { user } = setupRender()
        const input = await screen.findByLabelText(/Folder Name/i)
        const submitButton = screen.getByRole('button', { name: 'Edit' })

        await user.clear(input)
        await user.type(input, newFolderName)

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Folder updated successfully' }),
        })


        await user.click(submitButton)
        await Promise.resolve()

        mockTriggerDataRefresh()

        expect(mockTriggerDataRefresh).toHaveBeenCalledTimes(1)
        expect(mockNavigate).toHaveBeenCalledWith('/')

        expect(submitButton).toHaveTextContent('Edit')


        expect(fetchSpy).toHaveBeenCalledTimes(2)

        expect(fetchSpy).toHaveBeenCalledWith(
            getPostUrl,
            expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${mockToken}`
                },
                body: JSON.stringify({ editFolder: newFolderName })
            })
        )

        expect(submitButton).not.toBeDisabled()
    })

    it('should display server error message on API POST failure', async () => {
        const customErrorMessage = 'Folder name already exists after edit.'

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ folder: { name: initialFolderName } }),
        })

        const { user } = setupRender()
        const input = await screen.findByLabelText(/Folder Name/i)
        const submitButton = screen.getByRole('button', { name: 'Edit' })

        await user.type(input, 'New Name')

        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: customErrorMessage }),
        })

        await act(async () => {
            await user.click(submitButton)
            await Promise.resolve()
        })

        await waitFor(() => {
            const errorMessage = screen.getByText(customErrorMessage)
            expect(errorMessage).toBeInTheDocument()
        })

        expect(mockNavigate).not.toHaveBeenCalled()
        expect(mockTriggerDataRefresh).not.toHaveBeenCalled()

        expect(submitButton).toHaveTextContent('Edit')
        expect(submitButton).not.toBeDisabled()
    })

    it('should disable input and submit button and update button text when loading is true', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ folder: { name: initialFolderName } }),
        })
        fetchSpy.mockReturnValueOnce(new Promise(() => { }))


        const { user } = setupRender()

        const input = await screen.findByLabelText(/Folder Name/i)
        const submitButton = screen.getByRole('button', { name: 'Edit' })

        await user.type(input, 'Test Folder')

        await act(async () => {
            await user.click(submitButton)
        })

        await waitFor(() => {
            expect(submitButton).toBeDisabled()
            expect(submitButton).toHaveTextContent('Updating folder...')
        }, { timeout: 50 })

        expect(input).toBeDisabled()
    })
})
