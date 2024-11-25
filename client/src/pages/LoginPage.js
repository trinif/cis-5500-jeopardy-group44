import { createContext, useContext, useState } from 'react';
import { useAuth } from '../components/Context';

const config = require('../config.json');

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { userId, setUserId } = useAuth();

    // handles registration after clicking 'Register' button
    const registerButtonHandler = () => {
        fetch(`http://${config.server_host}:${config.server_port}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password}),
            credentials: 'same-origin'
        }).then(res => {
            if (!res.ok) {
                throw new Error('Username already exists')
            }
            return res.json()
        }).then(resJson => {
            setUserId(resJson.username)
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
            setUserId(resJson.username)
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