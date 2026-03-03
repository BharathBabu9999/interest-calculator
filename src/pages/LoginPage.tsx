import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="relative min-h-screen bg-linear-to-br from-gray-100 to-gray-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interest Calculator</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Sign in to manage your clients</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg px-3 py-2 text-sm">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-gray-500 dark:text-slate-400 text-sm text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              Create one
            </Link>
          </p>
        </div>

        <div className="relative flex items-center my-5">
          <div className="grow border-t border-gray-300 dark:border-slate-600" />
          <span className="px-3 text-xs text-gray-400 dark:text-slate-500">or</span>
          <div className="grow border-t border-gray-300 dark:border-slate-600" />
        </div>

        <Link
          to="/guest"
          className="block w-full text-center py-2.5 px-4 text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          Continue as Guest
        </Link>
      </div>
    </div>
  );
}
