// Login.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import { CircularProgress } from '@material-ui/core';
import useLogin from './hooks/useLogin';



const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login, logout, token, isLoading, error} = useLogin();

    const navigate = useNavigate();
    console.log('Login token', token);
    console.log('Login error', error);

    useEffect(() => {
        console.log('LOGIN useEffect token', token);
        if (token) {
            const origin = location.state?.from?.pathname || '/chatbot-settings';
            navigate(origin);
        }
    }, [token]);

    if(isLoading) {
        return <CircularProgress />;
    }

    const handleLogin = () => {
        login(username, password);
    };

    return (
        <div className='login-form'>
            <h1>Login</h1>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button onClick={handleLogin}>Login</button>
            {error && <div>Login failed: {error.data.message}</div>}
        </div>
    );
};

export default Login;
