import React from "react";
import { Form } from "@heroui/react";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@heroui/react";

const Login = () => {
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in successfully");

      const user = auth.currentUser;
      const userData = await getDoc(doc(db, "users", user.uid));
      if (userData.exists()) {
        const userData = userData.data();
        console.log(userData);
      }
      navigate("/");
    } catch {
      toast.danger("Invalid email or password");
    }
  };

  return (
    <div className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050506] px-4 py-12 text-white">
      {/* ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.35),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(56,189,248,0.12),transparent_50%),radial-gradient(ellipse_50%_35%_at_0%_80%,rgba(167,139,250,0.1),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)]"
      />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">
            403 Labs
          </p>
          <h1 className="mt-3 font-semibold tracking-tight text-3xl text-white sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Sign in to continue to your workspace.
          </p>
        </div>

        <Form
          className="flex flex-col gap-6 rounded-2xl border border-white/8 bg-[#0c0c0f]/80 p-8 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-9"
          onSubmit={onSubmit}
        >
          <TextField
            isRequired
            name="email"
            type="email"
            validate={(value) => {
              if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                return "Please enter a valid email address";
              }
              return null;
            }}
          >
            <Label className="px-0.5 text-sm font-medium text-zinc-300">
              Email
            </Label>
            <Input
              className="mt-1.5"
              placeholder="you@company.com"
              autoComplete="email"
            />
            <FieldError />
          </TextField>

          <TextField isRequired minLength={8} name="password" type="password">
            <Label className="px-0.5 text-sm font-medium text-zinc-300">
              Password
            </Label>
            <Input
              className="mt-1.5"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <FieldError />
          </TextField>

          <Button
            type="submit"
            color="primary"
            className="mt-1 w-full rounded-xl font-medium shadow-lg shadow-violet-500/25 transition-[transform,box-shadow] hover:shadow-violet-500/35 active:scale-[0.99]"
          >
            Sign in
          </Button>
        </Form>

        <p className="mt-8 text-center text-xs text-zinc-500">
          Secure sign-in powered by Firebase Authentication.
        </p>
      </div>
    </div>
  );
};

export default Login;
