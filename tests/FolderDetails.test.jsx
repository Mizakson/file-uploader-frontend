import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import React from 'react'
import FolderDetails from '../src/components/FolderDetails'

// Mocks

const mockUser = { id: 456, name: 'Test User' }
const mockNavigate = vi.fn()
const mockTriggerDataRefresh = vi.fn()
const mockToken = 'test-auth-token-456'
const mockApiUrl = 'http://test-api.com'
const mockFolderId = 'fld-101'
const mockFolderName = 'Project X Documents'
const mockFiles = [
    { id: 'f-abc', name: 'report.pdf' },
    { id: 'f-def', name: 'image.jpg' },
    { id: 'f-ghi', name: 'data.xlsx' },
]

vi.stubGlobal('localStorage', {
    getItem: (key) => {
        if (key === 'token') return mockToken
        return null
    }
})

vi.stubEnv('VITE_API_URL', mockApiUrl)

const mockWindowOpen = vi.spyOn(window, 'open').mockImplementation(() => { })

vi.mock('react-router-dom', () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    useNavigate: () => mockNavigate,
    useParams: () => ({ folderId: mockFolderId }),
}))

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        dataRefreshKey: 0,
        triggerDataRefresh: mockTriggerDataRefresh
    }),
}))

let fetchSpy

const fetchFilesUrl = `${mockApiUrl}/api/content/folder/${mockFolderId}/files`
const deleteFileBaseUrl = `${mockApiUrl}/api/content/files/${mockFolderId}`
const signedUrlBaseUrl = `${mockApiUrl}/api/content/files/${mockFolderId}`


beforeEach(() => {
    vi.clearAllMocks()
    fetchSpy = vi.spyOn(global, 'fetch')
})

afterEach(() => {
    fetchSpy.mockRestore()
    mockWindowOpen.mockClear()
})

const setupRender = () => {
    const user = userEvent.setup()
    render(<FolderDetails />)
    return { user }
}


// Tests

describe('FolderDetails', () => {

    it('should display loading state initially and successfully fetch and render folder contents', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                folder: {
                    name: mockFolderName,
                    files: mockFiles
                }
            }),
        })

        setupRender()

        expect(screen.getByText(/Loading folder details.../i)).toBeInTheDocument()

        expect(fetchSpy).toHaveBeenCalledWith(
            fetchFilesUrl,
            expect.objectContaining({
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${mockToken}`,
                    "Content-Type": "application/json",
                },

            })
        )

        const heading = await screen.findByRole('heading', { name: `Folder ${mockFolderName}` })
        expect(heading).toBeInTheDocument()

        expect(screen.getByText(mockFiles[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockFiles[1].name)).toBeInTheDocument()
        expect(screen.getByText(mockFiles[2].name)).toBeInTheDocument()

        expect(screen.queryByText(/Loading folder details.../i)).not.toBeInTheDocument()
    })

    it('should display error message if initial fetch fails', async () => {
        const customErrorMessage = 'Folder not found or inaccessible.'
        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: customErrorMessage }),
        })

        setupRender()

        const errorMessage = await screen.findByText(customErrorMessage)
        expect(errorMessage).toBeInTheDocument()

        expect(screen.queryByText(/Loading folder details.../i)).not.toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: `Folder ${mockFolderName}` })).not.toBeInTheDocument()
    })

    it('should display the "no files" message for an empty folder', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                folder: {
                    name: mockFolderName,
                    files: []
                }
            }),
        })

        setupRender()

        const emptyMessage = await screen.findByText(/This folder has no files. Click the upload button to add one./i)
        expect(emptyMessage).toBeInTheDocument()

        expect(screen.queryByText(mockFiles[0].name)).not.toBeInTheDocument()
    })

    it('should navigate to the file details page when View Details is clicked', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                folder: { name: mockFolderName, files: mockFiles }
            }),
        })

        const { user } = setupRender()

        await screen.findByText(mockFiles[0].name)

        const firstFileDetailsButton = screen.getAllByRole('button', { name: 'View Details' })[0]

        await user.click(firstFileDetailsButton)

        expect(mockNavigate).toHaveBeenCalledWith(`/file/${mockFolderId}/${mockFiles[0].id}`)
    })

    it('should correctly delete a file from the list on successful API response', async () => {
        const fileToDeleteId = mockFiles[1].id

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                folder: { name: mockFolderName, files: mockFiles }
            }),
        })
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'File deleted' }),
        })

        const { user } = setupRender()

        await screen.findByText(mockFiles[0].name)

        const fileToDeleteElement = screen.getByText(mockFiles[1].name)
        expect(fileToDeleteElement).toBeInTheDocument()

        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' })

        await user.click(deleteButtons[1])

        expect(fetchSpy).toHaveBeenCalledWith(
            `${deleteFileBaseUrl}/${fileToDeleteId}/delete-file`,
            expect.objectContaining({ method: "POST" })
        )

        await waitFor(() => {
            expect(screen.queryByText(mockFiles[1].name)).not.toBeInTheDocument()
        })

        expect(screen.queryByText(/Loading folder details.../i)).not.toBeInTheDocument()
    })

    it('should display error and keep files on list if delete API fails', async () => {
        const errorMsg = 'Failed to delete file due to server error.'

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ folder: { name: mockFolderName, files: mockFiles } }),
        })

        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ message: errorMsg }),
        })

        const { user } = setupRender()

        await screen.findByText(mockFiles[0].name)
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' })

        await act(async () => {
            await user.click(deleteButtons[2])
        })

        expect(screen.getByText(errorMsg)).toBeInTheDocument()

        expect(screen.getByText(mockFiles[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockFiles[1].name)).toBeInTheDocument()
        expect(screen.getByText(mockFiles[2].name)).toBeInTheDocument()
    })

    it('should fetch signed URL and trigger window.open on successful download', async () => {
        const signedUrl = 'https://signed.url/download-link'
        const fileToDownload = mockFiles[0]

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                folder: { name: mockFolderName, files: mockFiles }
            }),
        })

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ signedUrl }),
        })

        const { user } = setupRender()

        await screen.findByText(fileToDownload.name)

        const downloadButtons = screen.getAllByRole('button', { name: 'Download' })
        await user.click(downloadButtons[0])

        expect(fetchSpy).toHaveBeenCalledWith(
            `${signedUrlBaseUrl}/${fileToDownload.id}/signed-url`,
            expect.objectContaining({ method: "GET" })
        )

        await waitFor(() => {
            expect(mockWindowOpen).toHaveBeenCalledWith(signedUrl, '_self')
        })

        expect(screen.queryByText(/Loading folder details.../i)).not.toBeInTheDocument()
    })

    it('should display error message if download fetch fails', async () => {
        const fileToDownload = mockFiles[1]
        const errorMsg = 'Download failed: Resource not found.. Please try again.'

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ folder: { name: mockFolderName, files: mockFiles } }),
        })

        fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'Resource not found.' }),
        })

        const { user } = setupRender()

        await screen.findByText(fileToDownload.name)
        const downloadButtons = screen.getAllByRole('button', { name: 'Download' })
        await user.click(downloadButtons[1])

        expect(screen.getByText(errorMsg)).toBeInTheDocument()

        expect(mockWindowOpen).not.toHaveBeenCalled()

        expect(screen.queryByText(/Loading folder details.../i)).not.toBeInTheDocument()
    })
})
