import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({
    user: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
})

const API_URL = import.meta.env.VITE_API_URL

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [authToken, setAuthToken] = useState(null)

    useEffect(() => {
        const checkSession = async () => {

            const token = localStorage.getItem('token')

            const cleanToken = token ? token.trim() : null

            if (cleanToken) {
                setAuthToken(cleanToken)
            } else {
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`${API_URL}/api/current-user`, {
                    headers: {
                        'Authorization': `Bearer ${cleanToken}`,
                    }
                })

                if (!response.ok) {
                    console.log(`Session check failed with status: ${response.status}`)

                    const errorText = await response.text()
                    console.error("Server Error Response:", errorText)

                    if (response.status === 401) {
                        localStorage.removeItem('token')
                    }

                    setUser(null)
                    return
                }

                const userData = await response.json()
                setUser(userData.user)
            } catch (err) {
                console.error("Session check failed: ", err)
                setUser(null)
                localStorage.removeItem('token')
            } finally {
                setLoading(false)
            }

        }

        checkSession()
    }, [])

    const login = async (userData) => {
        setUser(userData)

        const token = localStorage.getItem('token')
        const cleanToken = token.replace('Bearer ', '').trim()
        localStorage.setItem('token', cleanToken)
    }

    const logout = async () => {
        try {

            const response = await fetch(`${API_URL}/api/logout`, {
                method: 'POST'
            })

            if (!response.ok) {
                console.warn("Logout request failed on server side")

            }

            setUser(null)
            localStorage.removeItem('token')

        } catch (err) {
            console.error("Logout failed: ", err)
            setUser(null)
        }

        setAuthToken(null)
    }

    const value = {
        user,
        loading,
        login,
        logout,
        authToken,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider >
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}