import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '../src/css/index.css'

import { AuthProvider } from './contexts/AuthContext.jsx'

import Homepage from './pages/Homepage.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
// import Profile from './pages/Profile.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
// import ProtectedRoute from './components/ProtectedRoute.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
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
  /* 
  {
    element: <ProtectedRoute />, 
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/profile",
        element: <Profile />,
      }
    ]
  }
  */
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}></RouterProvider>
    </AuthProvider>
  </StrictMode>,
)
