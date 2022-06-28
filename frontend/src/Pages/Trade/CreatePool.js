import React from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css'
import { Form } from 'react-bootstrap'
import { Link, useMatch, useResolvedPath } from "react-router-dom";

function CreatePool() {

    return(
        <nav>
            <CustomLink to="/Trade">Back</CustomLink>
            <Form>
                
            </Form>
        </nav>
    )

    function CustomLink({ to, children, ...props }) {
        const resolvedPath = useResolvedPath(to)
        const isActive = useMatch({ path: resolvedPath.pathname, end: true })
        return (
            <li className={isActive ? "active" : ""}>
                <Link to={to} {...props}>{children}</Link>
            </li>
        )

    }
}

export default CreatePool;