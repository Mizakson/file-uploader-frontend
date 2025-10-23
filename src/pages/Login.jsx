import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { login } = useAuth()

    const API_URL = import.meta.env.VITE_API_URL

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        let response
        let responseData

        try {
            response = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password })
            })

            if (!response.ok) {
                let errorData
                try {
                    errorData = await response.json();
                } catch (e) {
                    console.error(`Failed to parse error response body (Status ${response.status}): `, e);
                    throw new Error(`HTTP Error, status: ${response.status}`);
                }

                const serverErrorMessage = errorData.message || errorData.error || `HTTP Error, status: ${response.status}`;
                throw new Error(serverErrorMessage);
            }

            responseData = await response.json()
            console.log("User logged in: ", responseData)
            const tokenString = responseData.token

            const cleanToken = tokenString.replace('Bearer ', '').trim()

            localStorage.setItem('token', cleanToken)
            login(responseData.user)

            navigate("/")
        } catch (err) {
            console.error("Login failed", err.message)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} id="login-form">
                {error && (
                    <p className="error-msg" style={{ color: "red" }}>{error}</p>
                )}
                <div className="fields">
                    <fieldset>
                        <label htmlFor="username">Username </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="password">Password </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </fieldset>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <div className="options-text">
                <p>Go back <Link to='/'>home</Link></p>
                <p>Do not have an account? Sign up <Link to="/sign-up">here</Link>.</p>
            </div>
        </div>
    )
}

export default Login