// app/register/page.jsx
"use client";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/pages/register/RegisterForm";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 
  const router = useRouter();
  const auth = getAuth(app);

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (error) {
      if(error.code === "auth/email-already-in-use"){
        setErrorMessage("Email already in use. Please Log in.");
      }
      else if(error.code === "auth/weak-password"){
        setErrorMessage("Password should be at least 6 characters.");
      }
      else{
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#e6d0b1', minHeight: '100vh' }}>
        <RegisterForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} handleRegister={handleRegister} errorMessage={errorMessage}/>
    </div>
  );
}
