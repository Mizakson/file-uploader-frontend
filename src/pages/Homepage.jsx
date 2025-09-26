import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

function Homepage() {
    return (
        <div className='homepage-container'>
            <h1 className='title-text' id='hompage-title-text'>File Uploader</h1>
            <div className='options' id='homepage-options'>
                <button><Link to='/sign-up'>Sign Up</Link></button>
                <button><Link to='/login'>Login</Link></button>
            </div>
        </div>
    )
}

export default Homepage