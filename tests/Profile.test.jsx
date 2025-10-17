import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter, useNavigate, Link } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import Profile from '../src/pages/Profile'
import { useAuth } from '../src/contexts/AuthContext'

// Mocks

import.meta.env.VITE_API_URL = 'http://test-api.com'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: vi.fn(({ to, children }) => <a href={to}>{children}</a>)
    }
})


const localStorageMock = (function () {
    let store = {}
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString() }),
        clear: vi.fn(() => { store = {} }),
        removeItem: vi.fn((key) => { delete store[key] }),
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})


const mockLogout = vi.fn(() => {
    localStorageMock.removeItem('token')
})
const mockTriggerDataRefresh = vi.fn()

const mockAuthContextValue = {
    user: { id: 1, name: 'Test User' },
    logout: mockLogout,
    dataRefreshKey: 0,
    triggerDataRefresh: mockTriggerDataRefresh,
}

vi.mock('../src/contexts/AuthContext', () => ({
    useAuth: vi.fn(() => mockAuthContextValue),
}))


const mockFolders = [
    { id: 101, name: 'Folder A' },
    { id: 102, name: 'Folder B' },
]

const successfulFetch = vi.fn((url) => {
    if (url.includes('/api/current-user')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                user: mockAuthContextValue.user,
                folders: mockFolders
            }),
        })
    } else if (url.includes('/api/content/') && url.includes('/delete-folder')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Folder deleted' }),
        })
    }
    return Promise.resolve({ ok: false, status: 404 })
})

const setupRender = () => {
    return render(
        <BrowserRouter>
            <Profile />
        </BrowserRouter>
    )
}


// Tests

describe('Initial render and folder fetch', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = successfulFetch
        localStorageMock.setItem('token', 'mock-test-token-string')
        useAuth.mockImplementation(() => mockAuthContextValue)
    })

    it('should display loading text initially and then the user name and folders', async () => {
        setupRender()


        expect(screen.getByRole('heading', { name: /Hello Test User/i })).toBeInTheDocument()
        expect(screen.getByText('Loading folders...')).toBeInTheDocument()
        expect(global.fetch).toHaveBeenCalledTimes(1)

        await waitFor(() => {
            expect(screen.queryByText('Loading folders...')).not.toBeInTheDocument()
            expect(screen.getByText('Folder A')).toBeInTheDocument()
            expect(screen.getByText('Folder B')).toBeInTheDocument()
            expect(screen.getAllByRole('button', { name: /Edit/i })).toHaveLength(2)
            expect(screen.getAllByRole('button', { name: /Delete/i })).toHaveLength(2)
        })

        expect(global.fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_API_URL}/api/current-user`,
            expect.objectContaining({
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer mock-test-token-string"
                }
            })
        )
    })

    it('should display "no folders" message when fetch returns an empty array', async () => {
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ user: mockAuthContextValue.user, folders: [] }),
        }))
        setupRender()

        await waitFor(() => {
            expect(screen.getByText('You have no folders. Click the + button to create a folder.')).toBeInTheDocument()
        })
    })

    it('should display an error message if the fetch fails', async () => {
        global.fetch = vi.fn(() => Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ message: 'Unauthorized' }),
        }))
        setupRender()

        await waitFor(() => {
            expect(screen.getByText(/Unauthorized/i)).toBeInTheDocument()
        })

        expect(screen.queryByText('Loading folders...')).not.toBeInTheDocument()
        expect(screen.queryByText('Folder A')).not.toBeInTheDocument()
    })
})


describe('User actions (logout, button clicks, navigation)', () => {
    let user

    beforeEach(async () => {
        vi.clearAllMocks()
        global.fetch = successfulFetch
        localStorageMock.setItem('token', 'mock-test-token-string')
        useAuth.mockImplementation(() => mockAuthContextValue)

        setupRender()
        user = userEvent.setup()
        await waitFor(() => {
            expect(screen.getByText('Folder A')).toBeInTheDocument()
        })
    })

    it('should call logout function on logout button click', async () => {
        const logoutButton = screen.getByRole('button', { name: /Logout/i })

        await user.click(logoutButton)

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1)
        })

    })

    it('should call the delete API and refresh data on folder delete button click', async () => {
        const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
        const folderA_DeleteButton = deleteButtons[0]

        await user.click(folderA_DeleteButton)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                `${import.meta.env.VITE_API_URL}/api/content/101/delete-folder`,
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        "Authorization": "Bearer mock-test-token-string"
                    }
                })
            )
        })

        await waitFor(() => {
            expect(mockTriggerDataRefresh).toHaveBeenCalledTimes(1)
        })
    })

    it('should display an error if folder deletion fails', async () => {
        global.fetch.mockImplementationOnce((url) => {
            if (url.includes('/api/content/')) {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    json: () => Promise.resolve({ error: 'Server Down' }),
                })
            }
            return successfulFetch(url)
        })

        const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
        const folderA_DeleteButton = deleteButtons[0]

        await user.click(folderA_DeleteButton)

        await waitFor(() => {
            expect(screen.getByText(/Server Down/i)).toBeInTheDocument()
        })

        expect(screen.queryByText('Loading folders...')).not.toBeInTheDocument()
        expect(mockTriggerDataRefresh).not.toHaveBeenCalled()
    })

    it('should navigate to the correct routes when action buttons are clicked', async () => {
        const createFolderLink = screen.getByRole('link', { name: '+' })
        expect(createFolderLink).toHaveAttribute('href', '/add-folder')

        const editLink = screen.getAllByRole('link', { name: /Edit/i })[0]
        expect(editLink).toHaveAttribute('href', '/edit-folder/101')

        const detailsLink = screen.getAllByRole('link', { name: /Details/i })[0]
        expect(detailsLink).toHaveAttribute('href', '/folder/101')
    })
})