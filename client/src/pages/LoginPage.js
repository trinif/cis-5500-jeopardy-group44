import { createContext, useContext, useState } from 'react';

const config = require('../config.json');

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // handles registration after clicking 'Register' button
    const registerButtonHandler = () => {
        console.log("entered")
        fetch(`http://${config.server_host}:${config.server_port}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password}),
            credentials: 'same-origin'
        }).then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }
    
    // handles login after clicking 'Login' button
    const loginButtonHandler = () => {
        fetch(`http://${config.server_host}:${config.server_port}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password}),
            credentials: 'same-origin'
        }).then(res => {
            if (!res.ok) {
                if (res.status == 401) {
                    throw new Error('Incorrect username or password')
                }
            }

            return res.json()
        }).then(resJson => {
            console.log("login successful!")
            // set state as logged in with user_id = username
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <>
            <div>
                <p>Enter Username:</p>
                <input type='text' onChange={e => setUsername(e.target.value)}></input>
            </div>

            <div>
                <p>Enter Password:</p>
                <input type='text' onChange={e => setPassword(e.target.value)}></input>
            </div>

            <div>
                <button onClick={registerButtonHandler}>Register</button>
                <button onClick={loginButtonHandler}>Login</button>
            </div>
        </>
    );
}