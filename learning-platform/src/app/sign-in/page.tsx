"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, KeyRound, MessageSquareMore, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "verify-signup" | "forgot" | "reset">(
    "sign-in",
  );

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [signupSessionToken, setSignupSessionToken] = useState("");
  const [resetSessionToken, setResetSessionToken] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [otpPulse, setOtpPulse] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  function toErrorMessage(raw: unknown, fallback: string) {
    if (typeof raw === "string") return raw;
    if (raw && typeof raw === "object") {
      const maybeFlattened = raw as { formErrors?: unknown; fieldErrors?: Record<string, unknown> };
      const formErrors = Array.isArray(maybeFlattened.formErrors)
        ? maybeFlattened.formErrors.filter((item): item is string => typeof item === "string")
        : [];
      if (formErrors.length > 0) return formErrors[0];

      const fieldErrors = maybeFlattened.fieldErrors;
      if (fieldErrors && typeof fieldErrors === "object") {
        for (const value of Object.values(fieldErrors)) {
          if (Array.isArray(value)) {
            const firstText = value.find((item): item is string => typeof item === "string");
            if (firstText) return firstText;
          }
        }
      }
    }
    return fallback;
  }

  function routeByRole() {
    return "/home";
  }

  const modeTitle =
    mode === "sign-in"
      ? "Sign In"
      : mode === "sign-up"
        ? "Create Account"
        : mode === "verify-signup"
          ? "Verify OTP"
          : mode === "forgot"
            ? "Forgot Password"
            : "Reset Password";
  const otp = otpDigits.join("");
  const canResendOtp = otpCountdown <= 0 && !loading;

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const id = setInterval(() => setOtpCountdown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [otpCountdown]);

  useEffect(() => {
    if (mode === "verify-signup" || mode === "reset") {
      otpInputRefs.current[0]?.focus();
    }
  }, [mode]);

  async function sendSignupOtpRequest() {
    const response = await fetch("/api/auth/signup/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        username,
        phone,
        role,
        password,
        confirmPassword,
      }),
    });
    return response;
  }

  async function sendResetOtpRequest() {
    const response = await fetch("/api/auth/password/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    return response;
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(toErrorMessage(data.error, "Could not sign in."));
        return;
      }
      router.push(routeByRole());
      router.refresh();
    } catch {
      setError("Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function requestSignupOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await sendSignupOtpRequest();
      const data = await response.json();
      if (!response.ok) {
        setError(toErrorMessage(data.error, "Could not send OTP."));
        return;
      }
      setInfo("OTP sent to your number. Enter it to complete signup.");
      setSignupSessionToken(data.sessionToken ?? "");
      setOtpPulse(true);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpCountdown(30);
      setTimeout(() => setOtpPulse(false), 1200);
      setMode("verify-signup");
    } catch {
      setError("Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifySignupOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit OTP.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/signup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, sessionToken: signupSessionToken }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(toErrorMessage(data.error, "OTP verification failed."));
        return;
      }
      router.push(routeByRole());
      router.refresh();
    } catch {
      setError("Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function requestPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const response = await sendResetOtpRequest();
      const data = await response.json();
      if (!response.ok) {
        setError(toErrorMessage(data.error, "Could not request password reset."));
        return;
      }
      setInfo("Reset OTP sent. Enter OTP and new password.");
      setResetSessionToken(data.sessionToken ?? "");
      setOtpPulse(true);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpCountdown(30);
      setTimeout(() => setOtpPulse(false), 1200);
      setMode("reset");
    } catch {
      setError("Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit OTP.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/password/confirm-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp,
          newPassword,
          confirmPassword: confirmNewPassword,
          sessionToken: resetSessionToken,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(toErrorMessage(data.error, "Could not reset password."));
        return;
      }
      setInfo("Password reset successful. Please sign in.");
      setMode("sign-in");
      setPassword("");
    } catch {
      setError("Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((digit, idx) => {
      next[idx] = digit;
    });
    setOtpDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  }

  async function resendOtp() {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const response = mode === "verify-signup" ? await sendSignupOtpRequest() : await sendResetOtpRequest();
      const data = await response.json();
      if (!response.ok) {
        setError(toErrorMessage(data.error, "Could not resend OTP."));
        return;
      }
      if (mode === "verify-signup") {
        setSignupSessionToken(data.sessionToken ?? signupSessionToken);
      } else {
        setResetSessionToken(data.sessionToken ?? resetSessionToken);
      }
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpCountdown(30);
      setOtpPulse(true);
      setInfo("A new OTP has been sent.");
      setTimeout(() => setOtpPulse(false), 1200);
      otpInputRefs.current[0]?.focus();
    } catch {
      setError("Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f2fb] pb-10">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 md:px-6">
        <p className="text-lg font-black tracking-tight text-slate-900">AfriLearn</p>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link className="text-slate-900" href="/">Home</Link>
          <a href="#">Teachers</a>
          <a href="#">Offers</a>
          <a href="#">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>
            {mode === "sign-in" || mode === "forgot" || mode === "reset" ? "Sign In" : "Sign Up"}
          </Button>
          <Link href="/">
            <Button size="sm">Free Trial</Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
      <div className="grid w-full items-center gap-6 lg:grid-cols-[1fr_1.05fr]">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="neo-surface space-y-5 rounded-3xl p-6 md:p-8"
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            <MessageSquareMore className="h-3.5 w-3.5" />
            Secure Phone-First Access
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Learn, teach, and manage confidently
          </h1>
          <p className="text-slate-600">
            Built for Ghanaian schools with mobile number login, OTP verification, and clear step-by-step flows.
          </p>
          <div className="grid gap-3 text-sm text-slate-700">
            <div className="material-panel flex items-center gap-2 rounded-xl px-3 py-2.5">
              <UserRound className="h-4 w-4 text-indigo-600" />
              Sign up with full name, username, role, and Ghana number.
            </div>
            <div className="material-panel flex items-center gap-2 rounded-xl px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Verify account ownership using SMS OTP.
            </div>
            <div className="material-panel flex items-center gap-2 rounded-xl px-3 py-2.5">
              <KeyRound className="h-4 w-4 text-amber-600" />
              Reset password securely with number confirmation and OTP.
            </div>
          </div>
        </motion.section>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="w-full space-y-4 rounded-3xl p-5 md:p-7">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">{modeTitle}</h2>
            <p className="text-sm text-slate-600">Use your Ghana mobile number and follow the guided steps.</p>
          </div>
          <div className="relative grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
              className={`absolute top-1 h-[calc(100%-8px)] rounded-lg bg-white shadow ${
                mode === "sign-in" || mode === "forgot" || mode === "reset" ? "left-1 w-[calc(50%-6px)]" : "left-1/2 w-[calc(50%-6px)]"
              }`}
            />
            <button
              className={`relative z-10 rounded-lg px-3 py-2 text-sm font-medium ${
                mode === "sign-in" || mode === "forgot" || mode === "reset" ? "text-slate-900" : "text-slate-600"
              }`}
              onClick={() => setMode("sign-in")}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`relative z-10 rounded-lg px-3 py-2 text-sm font-medium ${
                mode === "sign-up" || mode === "verify-signup" ? "text-slate-900" : "text-slate-600"
              }`}
              onClick={() => setMode("sign-up")}
              type="button"
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "sign-in" ? (
              <motion.form
                key="sign-in"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onSubmit={signIn}
                className="space-y-3.5"
              >
            <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Username or Ghana Number</span>
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="username or 024xxxxxxx"
                  className="input-field"
              />
            </label>
            <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
            </label>
            <Button disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="w-full text-center text-sm font-medium text-indigo-600"
            >
              Forgot password?
            </button>
              </motion.form>
            ) : null}

            {mode === "sign-up" ? (
              <motion.form
                key="sign-up"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onSubmit={requestSignupOtp}
                className="space-y-3.5"
              >
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Full Name</span>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Username</span>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Ghana Mobile Number</span>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024xxxxxxx or +23324xxxxxxx"
                  className="input-field"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "STUDENT" | "TEACHER")}
                  className="input-field"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</span>
                <div className="relative">
                  <input
                    type={showSignupConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirmPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                    aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
            </label>
            <Button disabled={loading} className="w-full">
              {loading ? "Sending OTP..." : "Sign Up and Send OTP"}
            </Button>
              </motion.form>
            ) : null}

            {mode === "verify-signup" ? (
              <motion.form
                key="verify-signup"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onSubmit={verifySignupOtp}
                className="space-y-3.5"
              >
              <motion.p
                animate={otpPulse ? { scale: [1, 1.03, 1], boxShadow: ["0 0 0 0 rgba(79,70,229,0.25)", "0 0 0 8px rgba(79,70,229,0)", "0 0 0 0 rgba(79,70,229,0)"] } : {}}
                transition={{ duration: 0.8 }}
                className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-700"
              >
                Enter the 6-digit code sent to your phone.
              </motion.p>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Ghana Mobile Number</span>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">OTP Code</span>
                <div className="flex gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={`signup-otp-${index}`}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-center text-base font-semibold text-slate-800 shadow-sm focus:border-indigo-500"
                    />
                  ))}
                </div>
            </label>
            <Button disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Verify OTP and Create Account"}
            </Button>
              <button
                type="button"
                onClick={resendOtp}
                disabled={!canResendOtp}
                className="w-full text-center text-sm font-medium text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {canResendOtp ? "Resend OTP" : `Resend OTP in ${otpCountdown}s`}
              </button>
            <button
              type="button"
              onClick={() => setMode("sign-up")}
              className="w-full text-center text-sm font-medium text-indigo-600"
            >
              Back to signup details
            </button>
              </motion.form>
            ) : null}

            {mode === "forgot" ? (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onSubmit={requestPasswordReset}
                className="space-y-3.5"
              >
              <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                We will first confirm this number belongs to an existing account.
              </p>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Confirm Ghana Number</span>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024xxxxxxx"
                  className="input-field"
              />
            </label>
            <Button disabled={loading} className="w-full">
              {loading ? "Checking account..." : "Send Reset OTP"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              className="w-full text-center text-sm font-medium text-indigo-600"
            >
              Back to sign in
            </button>
              </motion.form>
            ) : null}

            {mode === "reset" ? (
              <motion.form
                key="reset"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onSubmit={confirmPasswordReset}
                className="space-y-3.5"
              >
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Ghana Number</span>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Reset OTP</span>
                <div className="flex gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={`reset-otp-${index}`}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-center text-base font-semibold text-slate-800 shadow-sm focus:border-indigo-500"
                    />
                  ))}
                </div>
            </label>
              <button
                type="button"
                onClick={resendOtp}
                disabled={!canResendOtp}
                className="w-full text-center text-sm font-medium text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {canResendOtp ? "Resend OTP" : `Resend OTP in ${otpCountdown}s`}
              </button>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">New Password</span>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</span>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                    aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
            </label>
            <Button disabled={loading} className="w-full">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
              </motion.form>
            ) : null}
          </AnimatePresence>

          {info ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p> : null}
          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          </Card>
        </motion.div>
      </div>
      <section className="material-panel rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 px-5 py-4 text-white">
        <div className="grid gap-3 text-sm font-medium md:grid-cols-5">
          <p className="opacity-90">GitHub</p>
          <p className="opacity-90">Coursera</p>
          <p className="opacity-90">Microsoft</p>
          <p className="opacity-90">Apple</p>
          <p className="opacity-90">Google</p>
        </div>
      </section>
      </main>
    </div>
  );
}
