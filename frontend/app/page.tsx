"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Avatar, AvatarFallback, } from '@/components/ui/avatar';
import axios from 'axios';
import { API_URL } from '@/server';
import { setAuthUser } from '@/store/authSlice';
import { toast } from 'sonner';


const HomePage = () => {

  const user = useSelector(( state:RootState) => state.auth.user);
  const dispatch = useDispatch()

  const handleLogout = async() => {
    await axios.get(`${API_URL}/auth/logout`);
    dispatch(setAuthUser(null));
    toast.success('Logout successfull')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-[8vh] shadow-md">
        <div className="w-full md:w-[80%] mx-auto flex items-center justify-between h-full px-4">
          <h1 className="text-2xl font-bold uppercase">Logo</h1>
            { !user && <Link href= "/auth/signup" >
              <Button className="px-4 py-2 text-base bg-black text-white rounded hover:ring-offset-slate-950">Register</Button>
            </Link> }
            { user && <div className='flex items-center space-x-2'>
              <Avatar onClick={handleLogout}>
                <AvatarFallback className='font-bold uppercase bg-slate-400'>{user.username.split("")[0]}</AvatarFallback>
              </Avatar>
              <Button>DashBoard</Button>
              <Button variant={"ghost"} size={"sm"}>
                { user.isVerified ? "user Verified" : "not verified"}
              </Button>
            </div> }
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <h1 className="font-bold text-4xl">Home Page</h1>
      </main>
    </div>
  );
};



export default HomePage