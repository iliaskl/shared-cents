import Link from "next/link";
import './RegisterForm.css';
export default function RegisterForm({ email, setEmail, password, setPassword, handleRegister, errorMessage }) {
    return (
        <div className="register-container">
            <div className="register-box">
            <div className="logo-wrapper">
                <img src="/images/Logo.png" alt="SharedCents Logo" width={120} height={120} className="landing-logo" />
            </div>
        <h2>User Register</h2>
        <form className="register-form" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <button type="submit">Register</button>
        </form>
        <p>Already have an account? <Link href="/login">Log in</Link></p>
        </div>
    </div>
    );
  }