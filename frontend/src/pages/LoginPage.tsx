import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { login as loginService } from "../services/auth";
import toast from "react-hot-toast";
import type { User } from "../types";

const loginSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await loginService({
        studentId: data.studentId,
        password: data.password,
      });
      // Map backend response to frontend format
      const user = response.user as unknown as User; // Type assertion to match the required User type
      login(user, response.token);
      toast.success("Logged in successfully!");
      navigate("/feed");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
    }
  };
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-surface-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20" />
        <div className="absolute w-96 h-96 -top-10 -left-10 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute w-96 h-96 -bottom-10 -right-10 bg-secondary-500/10 rounded-full blur-3xl" />
      </div>

      {/* Login Form Card */}
      <div className="relative w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-elevation hover:shadow-raised transition-all duration-300 space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-surface-600">Sign in to your UMPSA account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-surface-700 mb-1"
              >
                Student ID
              </label>
              <input
                id="studentId"
                type="text"
                {...register("studentId")}
                className="block w-full px-4 py-3 bg-white/50 border border-surface-200 rounded-xl 
                         transition-all duration-200 
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                         placeholder-surface-400"
                placeholder="Enter your student ID"
              />
              {errors.studentId && (
                <p className="mt-2 text-sm text-state-error">
                  {errors.studentId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-surface-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="block w-full px-4 py-3 bg-white/50 border border-surface-200 rounded-xl 
                         transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                         placeholder-surface-400"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-state-error">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 text-base font-semibold text-white 
                     bg-gradient-to-r from-primary-500 to-secondary-500 
                     rounded-xl shadow-soft hover:shadow-elevation
                     transform transition-all duration-200
                     hover:-translate-y-0.5 active:translate-y-0
                     focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
