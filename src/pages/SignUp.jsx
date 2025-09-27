import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"

function SignUp() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_API_URL

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (password.length < 6) {
            setError("Password length must be at least 6 characters")
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/user/sign-up`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password })
            })

            if (!response.ok) {
                throw new Error(`HTTP Error, status: ${response.status}`)
            }

            const repsonseData = await response.json()
            console.log("User created: ", repsonseData)

            navigate("/login")
        } catch (err) {
            console.error("Submission failed")
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="sign-up-container">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit} id="sign-up-form">
                {error && (
                    <p className="error-msg" style={{ color: "red" }}>{error}</p>
                )}
                <div className="fields">
                    <fieldset>
                        <label htmlFor="username">Username: </label>
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
                        <label htmlFor="password">Password: </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="confirm-password">Confirm Password: </label>
                        <input
                            type="password"
                            name="confirm-password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                    </fieldset>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>
            <div className="options-text">
                <p>Go back <Link to='/'>home</Link></p>
                <p>Already have an account? Login <Link to="/login">here</Link>.</p>
            </div>
        </div>
    )
}

export default SignUp