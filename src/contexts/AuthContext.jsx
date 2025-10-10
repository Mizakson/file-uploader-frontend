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

    useEffect(() => {
        const checkSession = async () => {

            if (localStorage.getItem('token')) {
                try {
                    const response = await fetch(`${API_URL}/api/current-user`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        }
                    })

                    if (!response.ok) {
                        console.log(response.status)
                    }

                    const userData = await response.json()
                    setUser(userData.user)
                } catch (err) {
                    console.error("Session check failed: ", err)
                    setUser(null)
                } finally {
                    setLoading(false)
                }
            } else {

            }


        }

        checkSession()
    }, [])

    const login = async (userData) => {
        setUser(userData)
    }

    const logout = async () => {
        try {

            await fetch(`${API_URL}/api/logout`, {
                method: 'POST'
            })

            if (!response.ok) {
                setUser(null)
            } else {
                console.warn("Logout request failed on server side")
                setUser(null)
            }

        } catch (err) {
            console.error("Logout failed: ", err)
            setUser(null)
        }
    }

    const value = {
        user,
        loading,
        login,
        logout,
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