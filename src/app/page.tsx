
import Image from 'next/image';
import * as React from 'react';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Background"
        fill
        objectFit="cover"
        className="z-0 opacity-20"
        data-ai-hint="firefighter heroic"
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      {/* 
        Suspense is a React feature that lets you display a fallback until 
        its children have finished loading. This is useful for components 
        that need to fetch data or use dynamic hooks. 
        In this case, it ensures the form with client-side hooks loads correctly.
      */}
      <React.Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </React.Suspense>
    </div>
  );
}

