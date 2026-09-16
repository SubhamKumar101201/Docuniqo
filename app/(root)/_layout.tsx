import { initializeStorage } from "@/lib/storage/initializeStorage";
import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";
import React, { useEffect } from "react";

export default function RootGroupLayout() {
  // initialize the storage function which call both database and file system and initialize both the functions
  useEffect(() => {
    initializeStorage().catch((error) => {
      console.error("Storage initialization failed:", error);
    });
  }, []);

  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return <Slot />;
}
