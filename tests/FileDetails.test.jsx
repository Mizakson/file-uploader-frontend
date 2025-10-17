import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import FileDetails from '../src/components/FileDetails'

// Mocks

const mockNavigate = vi.fn()
const mockAuth = {
    user: { id: 'user-123' },
    dataRefreshKey: 0,
    triggerDataRefresh: vi.fn(),
}

const mockFileId = 'file-456-def'
const mockFolderId = 'fld-123-abc'
const mockToken = 'test-details-token'
const mockApiUrl = 'http://test-api.com'
const getFileUrl = `${mockApiUrl}/api/content/files/${mockFileId}/`

const mockFileData = {
    // mockFileData date: "2024-01-20T14:45:00.000Z" -- in UTC
    // Expected format: Jan 20, 2024, 02:45 PM <local_time_zone>

    name: "Document.pdf",
    size: 5242880, // 5MB
    date: "2024-01-20T14:45:00.000Z",
}

vi.stubGlobal('localStorage', {
    getItem: (key) => {
        if (key === 'token') return mockToken
        return null
    }
})
vi.stubEnv('VITE_API_URL', mockApiUrl)

vi.mock('react-router-dom', () => ({
    Link: ({ to, children, className }) => <a href={to} className={className}>{children}</a>,
    useNavigate: () => mockNavigate,
    useParams: () => ({ fileId: mockFileId, folderId: mockFolderId }),
}))

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => mockAuth,
}))

let fetchSpy


beforeEach(() => {
    vi.clearAllMocks()
    fetchSpy = vi.spyOn(global, 'fetch')
    vi.spyOn(console, 'error').mockImplementation(() => { })
    vi.spyOn(console, 'log').mockImplementation(() => { })

    const originalToLocaleString = Date.prototype.toLocaleString;
    vi.spyOn(Date.prototype, 'toLocaleString').mockImplementation(function (locale, options) {
        if (this.toISOString() === mockFileData.date) {
            return 'Jan 20, 2024, 02:45 PM GMT';
        }
        return originalToLocaleString.apply(this, [locale, options]);
    });
})

afterEach(() => {
    fetchSpy.mockRestore()
    console.error.mockRestore()
    console.log.mockRestore()
    Date.prototype.toLocaleString.mockRestore();
})

const setupRender = () => {
    render(<FileDetails />)
}

// Tests

describe('FileDetails', () => {

    it('should show loading state initially and attempt to fetch data', () => {
        fetchSpy.mockReturnValue(new Promise(() => { }))

        setupRender()

        expect(screen.getByText('Loading file details...')).toBeInTheDocument()

        expect(fetchSpy).toHaveBeenCalledWith(
            getFileUrl,
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    "Authorization": `Bearer ${mockToken}`
                }),
            })
        )
    })

    it('should display file details upon successful fetch', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => mockFileData,
        })

        setupRender()

        expect(screen.getByText('Loading file details...')).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.queryByText('Loading file details...')).not.toBeInTheDocument()
        })

        expect(screen.getByRole('heading', { name: 'File Details' })).toBeInTheDocument()

        expect(screen.getByText('Document.pdf')).toBeInTheDocument()
        expect(screen.getByText('5 MB')).toBeInTheDocument()
        expect(screen.getByText('Jan 20, 2024, 02:45 PM GMT')).toBeInTheDocument()

        const backButton = screen.getByRole('button', { name: 'Back to Folder' })
        expect(backButton).toBeInTheDocument()
        expect(backButton.closest('a')).toHaveAttribute('href', `/folder/${mockFolderId}`)
    })

    it('should display the server error message on API fetch failure', async () => {
        const customErrorMessage = 'The requested file does not exist.'

        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ error: customErrorMessage }),
        })

        setupRender()

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Error Loading File' })).toBeInTheDocument()
        })

        expect(screen.getByText(customErrorMessage)).toBeInTheDocument()

        expect(screen.getByRole('link', { name: 'Go back to Folder' })).toHaveAttribute('href', `/folder/${mockFolderId}`)
        expect(screen.queryByRole('heading', { name: 'File Details' })).not.toBeInTheDocument()
    })

    it('should display generic HTTP error message if server response cannot be parsed', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 503,
            json: vi.fn(() => { throw new Error('Bad response') }),
        })

        setupRender()

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Error Loading File' })).toBeInTheDocument()
        })

        const expectedError = 'HTTP Error, status: 503'
        expect(screen.getByText(expectedError)).toBeInTheDocument()

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to fetch user data:'),
            expectedError
        )
    })
})
