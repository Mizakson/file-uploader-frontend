import { Link } from "react-router-dom"

function ErrorPage() {
    return (
        <div className="error-page-container">
            <h1>Error: this route doesn't exist...</h1>
            <Link to='/'>Go back home</Link>
        </div >
    )
}

export default ErrorPage