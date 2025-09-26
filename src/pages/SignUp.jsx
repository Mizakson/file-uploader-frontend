import { Link } from "react-router-dom"

function SignUp() {
    return (
        <div className="sign-up-container">
            <h1>Hi from sign-up page</h1>
            <p>Go back <Link to='/'>home</Link></p>
        </div>
    )
}

export default SignUp