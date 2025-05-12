// app/login/page.jsx
"use client";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/pages/login/LoginForm";
import "@/components/pages/login/LoginForm.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const auth = getAuth(app);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ backgroundColor: '#F7E4D0', minHeight: '100vh' }}>
        <div className="login-form-container">
        <LoginForm 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
        />
        </div>
    </div>
  );
}
