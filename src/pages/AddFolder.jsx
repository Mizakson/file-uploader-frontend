import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function AddFolder() {

    // newFolder, user.id

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [folderName, setFolderName] = useState("")

    const { user } = useAuth()
    const navigate = useNavigate()

    console.log(user)

    const API_URL = import.meta.env.VITE_API_URL

    const token = localStorage.getItem('token')

    const cleanToken = token ? token.trim() : null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        let response
        let responseData

        try {
            response = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cleanToken}`
                },
                body: JSON.stringify({ newFolder: folderName, id: user.id, })
            })

            if (!response.ok) {
                let errorData
                try {
                    errorData = await response.json()
                } catch (e) {
                    console.error(`Failed to parse error response body (Status ${response.status}): `, e)
                    throw new Error(`HTTP Error, status: ${response.status}`)
                }

                const serverErrorMessage = errorData.message || errorData.error || `HTTP Error, status: ${response.status}`
                throw new Error(serverErrorMessage)
            }

            responseData = await response.json()
            console.log(responseData)
            navigate('/')
        } catch (err) {
            console.error("Folder creation failed: ", err.message)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="add-folder-page-container">
            <h1>Add folder</h1>
            <form onSubmit={handleSubmit}>
                {error && (
                    <p className="error-msg" style={{ color: "red" }}>{error}</p>
                )}
                <div className="fields">
                    <fieldset>
                        <label htmlFor="newFolder">Folder Name: </label>
                        <input
                            type="text"
                            name="newFolder"
                            id="newFolder"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            disabled={loading}></input>
                    </fieldset>
                </div>
                <div className="form-btns">
                    <button type="submit" disabled={loading}>{loading ? 'Adding folder...' : '+'}</button>
                    <button><Link to='/'>Home</Link></button>
                </div>
            </form>
        </div>
    )
}

export default AddFolder