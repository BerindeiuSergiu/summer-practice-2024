import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../config/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./Auth.css";

export const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const signInWithEmail = async (e) => {
        e.preventDefault();
        console.log("Button clicked, form submitted");
        console.log("Email:", email);
        console.log("Password:", password);

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log("Sign in successful:", result);

            // Navigate to the main page
            navigate('/main-page');
        } catch (error) {
            console.error("Error signing in:", error.message);
            setError(error.message);
        }
    };

    const goToSignUp = () => {
        navigate('/sign-up');
    };

    return (
        <div className="auth-grid-container">
            <div className="auth-top-right">
                <div className="auth-login-page">
                    <p>To continue, sign in with an Email Account</p>
                    <form className="auth-form" onSubmit={signInWithEmail}>
                        <div className="auth-form-group">
                            <label className="auth-form-label">Email:</label>
                            <input
                                type="email"
                                className="auth-form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-form-label">Password:</label>
                            <input
                                type="password"
                                className="auth-form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="auth-error-message">{error}</p>}
                        <div className="auth-button-container">
                            <button className="auth-button-login" type="submit">
                                Log in
                            </button>
                            <button className="auth-button-signup" type="button" onClick={goToSignUp}>
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
