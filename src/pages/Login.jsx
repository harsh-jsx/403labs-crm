import React from "react";
import { Form } from "@heroui/react";
import {
  Button,
  Description,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@heroui/react";

const Login = () => {
  const onSubmit = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate("/");
    } catch (error) {
      return (
        <Alert color="danger">
          <AlertTitle className="text-white text-2xl">Error</AlertTitle>
          <AlertDescription className="text-white text-2xl">
            {error.message}
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <div className="w-full flex h-screen items-center justify-center text-white bg-[#060607]">
      <Form
        className="flex w-full max-w-md flex-col gap-4 bg-[#141418] p-15 rounded-lg shadow-md"
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
          <Label className="text-white text-2xl px-2 py-1">Email</Label>
          <Input placeholder="john@example.com" />
          <FieldError />
        </TextField>
        <TextField
          isRequired
          minLength={8}
          name="password"
          type="password"
          validate={(value) => {
            if (value.length < 8) {
              return "Password must be at least 8 characters";
            }
            if (!/[A-Z]/.test(value)) {
              return "Password must contain at least one uppercase letter";
            }
            if (!/[0-9]/.test(value)) {
              return "Password must contain at least one number";
            }

            return null;
          }}
        >
          <Label className="text-white text-2xl px-2 py-1">Password</Label>
          <Input placeholder="Enter your password" />

          <FieldError />
        </TextField>
        <div className="flex gap-2">
          <Button type="submit" color="primary">
            Login
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Login;
