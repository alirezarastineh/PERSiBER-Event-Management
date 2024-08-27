"use client";

import Image from "next/image";
import Heading from "../utils/Heading";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Heading title="PERSiBER" />
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="pt-8 md:pt-12">
          <Image
            src="https://i.imgur.com/MiwxKii.png"
            alt="PERSiBER Logo"
            width={150}
            height={50}
            className="object-contain w-auto h-auto max-w-full"
            sizes="(max-width: 768px) 100px, (max-width: 1200px) 150px, 200px"
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 mt-4">
          PERSiBER Event Management
        </h1>
        <p className="text-lg text-center">
          Welcome to the PERSiBER Event Management System
        </p>
      </div>
    </div>
  );
}
