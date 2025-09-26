import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '../src/css/index.css'

import Homepage from './pages/Homepage.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
    errorElement: <div>There has been an error :(</div>
  },
  {
    path: "/sign-up",
    element: <SignUp />,
    errorElement: <div>There has been an error :(</div>
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <div>There has been an error :(</div>
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
