import React, { useState, useRef } from "react";
import styles from "./Login.module.css";
import Input from "../../components/Form/Input";
import PasswordInput from "../../components/Form/PasswordInput";
import Button from "../../components/Form/Button";
import ErrorBanner from "../../components/Form/ErrorBanner";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const usernameRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!username.trim()) return "Username is required";
    if (!password) return "Password is required";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      if (!username.trim()) usernameRef.current?.focus();
      return;
    }

    setLoading(true);
    const result = await login({ username: username.trim(), password });
    setLoading(false);
    if (!result.success) {
      setError(result.error?.message || 'Invalid credentials');
      return;
    }

    // successful login — navigate to admin dashboard
    navigate('/admin', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} role="main" aria-labelledby="login-heading">
        <h1 id="login-heading" className={styles.title}>
          Admin Sign In
        </h1>
        {error && <ErrorBanner message={error} />}
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <Input
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin@example.com"
            ref={usernameRef}
            required
          />

          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <div className={styles.actions}>
            <Button type="submit" loading={loading} aria-label="Sign in">
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
