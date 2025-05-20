// app/login/page.jsx
"use client";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/shared/AuthForm";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const auth = getAuth(app);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div style={{ backgroundColor: '#F7E4D0', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <AuthForm
        title="Account Login"
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleSubmit={handleLogin}
        buttonText="Login"
        alternateText="Don't have an account? Sign up"
        alternatePath="/register"
        errorMessage={errorMessage}
      />
    </div>
  );
}