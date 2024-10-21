"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { API_URL } from "@/server";
import { Loader } from "lucide-react";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SignupPage = () => {

  const dispatch = useDispatch();
  const router = useRouter()

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/signup`, formData, {
        withCredentials: true,
      });
      const result = response.data.userData;
      toast.success("signup successfull")
      dispatch(setAuthUser(result));
      router.push('/auth/verify')
    } catch (error:any) {
      toast.error(error.response.data.message)
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-400 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-none bg-gray-200 rounded-md shadow-sm sm:text-sm"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-none bg-gray-200 rounded-md shadow-sm sm:text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-none bg-gray-200 rounded-md shadow-sm sm:text-sm"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-none bg-gray-200 rounded-md shadow-sm sm:text-sm"
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Submit Button */}
          <div>
            {!loading ? (
              <button
                type="submit"
                className="w-full flex justify-center my-8 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Submit
              </button>
            ) : (
              <button className="w-full flex justify-center my-8 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                <Loader className="animate-spin" />
              </button>
            )}
          </div>
        </form>

        {/* Already have an account */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-black hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
