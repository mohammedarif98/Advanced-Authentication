"use client";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const VarifyPage = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter()

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = event.target;
    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (value.length === 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ): void => {
    if (
      event.key === "Backspace" &&
      !inputRefs.current[index]?.value &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async() => {
    setLoading(true);
    try{
      const otpValue = otp.join("");
      const response = await axios.post(`${API_URL}/auth/verify`,{ otp: otpValue },{ withCredentials: true});
      const verifiedUser = response.data;
      dispatch(setAuthUser(verifiedUser));
      toast.success("Verification Successfull");
      router.push('/')
    }catch(error:any){
      toast.error(error.response.data.message);
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-300">
      <h1 className="text-2xl mb-4 font-semibold">
        Enter The Email Verification Code
      </h1>
      <div className="flex space-x-4">
        {otp.map((value, index) => {
          return (
            <input
              type="text" 
              key={index}
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(index, e)}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-14 rounded-lg bg-gray-100 text-3xl font-bold text-center no-spinner"
            />
          );
        })}
      </div>

      <div className="flex items-center space-x-4 mt-6">
        <Button onClick={ handleSubmit } variant={"default"}>Submit</Button>
        <Button className="bg-rose-600">Resend OTP</Button>
      </div>
    </div>
  );
};

export default VarifyPage;
