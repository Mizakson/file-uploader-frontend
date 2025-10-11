import { Link } from "react-router-dom"

function AddFolder() {
    return (
        <div className="add-folder-page-container">
            <h1>Hi from add folder page!</h1>
            <p>Go back <Link to='/'>home</Link></p>
        </div>
    )
}

export default AddFolder