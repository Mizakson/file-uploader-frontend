import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '../src/css/index.css'

import { AuthProvider } from './contexts/AuthContext.jsx'

import AppRouter from './components/AppRouter.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import AddFolder from './pages/AddFolder.jsx'
import EditFolder from './pages/EditFolder.jsx'
import FolderDetails from './components/FolderDetails.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppRouter />,
    errorElement: <ErrorPage />
  },
  {
    path: "/sign-up",
    element: <SignUp />,
    errorElement: <ErrorPage />
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "/add-folder",
    element: <AddFolder />,
    errorElement: <ErrorPage />
  },
  {
    path: "/edit-folder/:folderId",
    element: <EditFolder />,
    errorElement: <ErrorPage />
  },
  {
    path: "/folder/:folderId",
    element: <FolderDetails />,
    errorElement: <ErrorPage />
  },

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}></RouterProvider>
    </AuthProvider>
  </StrictMode>,
)
