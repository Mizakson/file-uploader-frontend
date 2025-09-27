import { Link } from "react-router-dom"

function Profile() {
    return (
        <div className="profile-page-container">
            <h1>Hello from profile page</h1>
            <p>Go back <Link to='/'>home</Link></p>
        </div>

    )
}

export default Profile