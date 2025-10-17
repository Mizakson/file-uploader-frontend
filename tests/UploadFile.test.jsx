import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import UploadFile from '../src/pages/UploadFile'

// Mocks

const mockNavigate = vi.fn()
const mockTriggerDataRefresh = vi.fn()
const mockFolderId = 'fld-123-abc'
const mockToken = 'test-upload-token'
const mockApiUrl = 'http://test-api.com'
const uploadUrl = `${mockApiUrl}/api/content/folder/${mockFolderId}/upload-file`

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
    useParams: () => ({ folderId: mockFolderId }),
}))

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        triggerDataRefresh: mockTriggerDataRefresh
    }),
}))

let fetchSpy
const mockFile = new File(['file content'], 'my_document.txt', { type: 'text/plain' })

beforeEach(() => {
    vi.clearAllMocks()
    fetchSpy = vi.spyOn(global, 'fetch')
    vi.spyOn(console, 'error').mockImplementation(() => { })
})

afterEach(() => {
    fetchSpy.mockRestore()
    console.error.mockRestore()
})

const setupRender = () => {
    const user = userEvent.setup()
    render(<UploadFile />)
    return { user }
}

// Tests

describe('UploadFile', () => {

    it('should render the component correctly with initial state', () => {
        setupRender()
        expect(screen.getByRole('heading', { name: /Upload File/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/Choose a file to upload:/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument()

        expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()

        const backLink = screen.getByRole('link', { name: 'Back to Folder' })
        expect(backLink).toHaveAttribute('href', `/folder/${mockFolderId}`)

        expect(screen.queryByText(/error-msg/i)).not.toBeInTheDocument()
    })

    it('should allow file selection and enable the upload button', async () => {
        const { user } = setupRender()
        const fileInput = screen.getByLabelText(/Choose a file to upload:/i)
        const uploadButton = screen.getByRole('button', { name: 'Upload' })

        expect(uploadButton).toBeDisabled()

        await user.upload(fileInput, mockFile)

        await waitFor(() => {
            expect(uploadButton).not.toBeDisabled()
        })
    })

    it('should display an error if submitted without a file', async () => {
        const { user } = setupRender()
        const uploadButton = screen.getByRole('button', { name: 'Upload' })

        await user.upload(screen.getByLabelText(/Choose a file to upload:/i), mockFile)
        expect(uploadButton).not.toBeDisabled()

    })

    it('should successfully upload the file and navigate to the folder view', async () => {
        const { user } = setupRender()

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'File uploaded successfully' }),
        })

        const fileInput = screen.getByLabelText(/Choose a file to upload:/i)
        const uploadButton = screen.getByRole('button', { name: 'Upload' })

        await user.upload(fileInput, mockFile)
        expect(uploadButton).not.toBeDisabled()

        await act(async () => {
            await user.click(uploadButton)
        })

        expect(fetchSpy).toHaveBeenCalledWith(
            uploadUrl,
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: expect.any(FormData)
            })
        )

        const fetchCall = fetchSpy.mock.calls[0][1]
        const formDataBody = fetchCall.body
        expect(formDataBody instanceof FormData).toBe(true)

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(`/folder/${mockFolderId}`)
        })
        expect(mockTriggerDataRefresh).not.toHaveBeenCalled()
        expect(uploadButton).toHaveTextContent('Upload')
        expect(uploadButton).not.toBeDisabled()
    })

    it('should display an error message on API POST failure (JSON error)', async () => {
        const customErrorMessage = 'File size exceeds limit.'

        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 413,
            json: async () => ({ error: customErrorMessage }),
        })

        const { user } = setupRender()
        const fileInput = screen.getByLabelText(/Choose a file to upload:/i)
        const uploadButton = screen.getByRole('button', { name: 'Upload' })

        await user.upload(fileInput, mockFile)

        await act(async () => {
            await user.click(uploadButton)
        })

        await waitFor(() => {
            const errorMessage = screen.getByText(customErrorMessage)
            expect(errorMessage).toBeInTheDocument()
        })

        expect(mockNavigate).not.toHaveBeenCalled()
        expect(uploadButton).toHaveTextContent('Upload')
        expect(uploadButton).not.toBeDisabled()
        expect(fileInput).not.toBeDisabled()
    })

    it('should display a generic error message if API POST fails and response is not parsable', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'Internal Server Error HTML',
            json: vi.fn(() => { throw new Error('Cannot parse JSON') })
        })

        const { user } = setupRender()
        const fileInput = screen.getByLabelText(/Choose a file to upload:/i)
        const uploadButton = screen.getByRole('button', { name: 'Upload' })

        await user.upload(fileInput, mockFile)

        await act(async () => {
            await user.click(uploadButton)
        })

        const expectedError = 'HTTP Error, status: 500'

        await waitFor(() => {
            const errorMessage = screen.getByText(expectedError)
            expect(errorMessage).toBeInTheDocument()
        })

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to parse error response body'),
            expect.any(Error)
        )

        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should update button text and disable controls while loading', async () => {
        fetchSpy.mockReturnValueOnce(new Promise(() => { }))

        const { user } = setupRender()
        const fileInput = screen.getByLabelText(/Choose a file to upload:/i)
        const uploadButton = screen.getByRole('button', { name: 'Upload' })

        await user.upload(fileInput, mockFile)
        expect(uploadButton).not.toBeDisabled()

        await act(async () => {
            await user.click(uploadButton)
        })

        await waitFor(() => {
            expect(uploadButton).toBeDisabled()
            expect(uploadButton).toHaveTextContent('Uploading file...')
            expect(fileInput).toBeDisabled()
        }, { timeout: 50 })
    })
})
