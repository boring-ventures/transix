'use client'

import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md">
            <Image
              src="/images/transix.svg"
              alt="Transix Logo"
              width={100}
              height={100}
              className="text-primary-foreground"
            />
          </div>
          <span className="text-2xl font-neutro tracking-wide">TRANSIX</span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}