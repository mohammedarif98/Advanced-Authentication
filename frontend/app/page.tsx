import React from 'react'
import { Button } from '@/components/ui/button'

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-[8vh] shadow-md">
        <div className="w-full md:w-[80%] mx-auto flex items-center justify-between h-full px-4">
          <h1 className="text-2xl font-bold uppercase">Logo</h1>
          <Button className="px-4 py-2 text-base bg-black text-white rounded hover:ring-offset-slate-950">Register</Button>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <h1 className="font-bold text-4xl">Home Page</h1>
      </main>
    </div>
  );
};

export default HomePage