import { Link } from "react-router-dom"

function Login() {
    return (
        <div className="login-container">
            <h1>Hi from login page</h1>
            <p>Go back <Link to='/'>home</Link></p>
        </div>
    )
}

export default Login