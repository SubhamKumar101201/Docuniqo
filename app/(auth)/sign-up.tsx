import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { codeSchema, SignUpFormValues, signUpSchema } from "@/lib/schemas/auth";
import { useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// ==================================================
// Password requirement pill
// ==================================================
function RequirementCheck({ met, label }: { met: boolean; label: string }) {
  return (
    <View className="w-1/2 flex-row items-center mb-1.5">
      <View
        className={`w-[14px] h-[14px] rounded-full border items-center justify-center ${
          met
            ? "border-[#38C8C6] bg-[#38C8C6]"
            : "border-[#C7D2DB] bg-transparent"
        }`}
      >
        {met && <Text className="text-white text-[9px] leading-[9px]">✓</Text>}
      </View>
      <Text
        className={`text-[10px] ml-2 ${met ? "text-[#38C8C6]" : "text-[#8B96A5]"}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { height, width } = useWindowDimensions();

  const isVerySmallScreen = height < 650;

  const isLoading = fetchStatus === "fetching";

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const {
    control: codeControl,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<{ code: string }>({
    resolver: zodResolver(codeSchema),
    mode: "onBlur",
    defaultValues: {
      code: "",
    },
  });

  const password = watch("password") || "";

  // Live password requirement checks (previously hardcoded to always show a check)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  // --------------------------------------------------
  // Full name -> firstName/lastName
  // Fixes the previous bug where onChangeText only ever
  // kept the first word, silently dropping the rest as
  // you typed (parts[0] was reassigned on every keystroke).
  // --------------------------------------------------
  const onFullNameChange = (text: string) => {
    setFullName(text);
    const parts = text.trim().split(/\s+/).filter(Boolean);
    const first = parts[0] || "";
    const last = parts.slice(1).join(" ");
    setValue("firstName", first, { shouldValidate: true });
    setValue("lastName", last, { shouldValidate: true });
  };

  // --------------------------------------------------
  // Email/password signup
  // --------------------------------------------------

  const onSignUpPress = async (values: SignUpFormValues) => {
    setEmail(values.email);

    const { error } = await signUp.password({
      emailAddress: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  // =========================================
  // GOOGLE
  // =========================================

  const onGoogleSignUpPress = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "docuniqo",
          path: "sso-callback",
        }),
      });

      if (createdSessionId && setActive) {
        await setActive({
          session: createdSessionId,
        });

        router.replace("/");
      }
    } catch (error) {
      console.error("Google Sign-Up Error:", JSON.stringify(error, null, 2));
    }
  };

  // --------------------------------------------------
  // Verify email
  // --------------------------------------------------

  const onVerifyPress = async ({ code }: { code: string }) => {
    const { error } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return;

          router.replace("/");
        },
      });
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  // ==================================================
  // EMAIL VERIFICATION SCREEN
  // ==================================================

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View className="flex-1">
        <GradientBackground />
        <SafeAreaView
          className="flex-1"
          style={{ backgroundColor: "transparent" }}
        >
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="flex-1 px-5 justify-center">
              <View className="items-center mb-8">
                <Image
                  source={require("../../assets/images/logo.png")}
                  className="w-20 h-20"
                  resizeMode="contain"
                />

                <Text className="text-[30px] font-bold text-[#071B49] mt-2">
                  Docuniqo
                </Text>

                <Text className="text-[#00AAA9] text-sm mt-1">
                  Smart Documents. Simplified.
                </Text>
              </View>

              <Text className="text-2xl font-bold text-[#071B49] text-center">
                Verify your account
              </Text>

              <Text className="text-[#7C899B] text-sm text-center mt-2 mb-7">
                We sent a verification code to {email}
              </Text>

              <Controller
                control={codeControl}
                name="code"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter verification code"
                    placeholderTextColor="#A0ACBA"
                    keyboardType="number-pad"
                    className="h-[54px] bg-white border border-[#E2EAF0] rounded-xl px-4"
                    style={{ color: "#16233B" }}
                    cursorColor="#16233B"
                    selectionColor="#16233B"
                  />
                )}
              />

              {codeErrors.code && (
                <Text className="text-red-500 text-xs mt-1">
                  {codeErrors.code.message}
                </Text>
              )}

              {errors.fields.code && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.fields.code.message}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleCodeSubmit(onVerifyPress)}
                disabled={isLoading}
                className="h-[52px] bg-[#08AAA9] rounded-xl items-center justify-center mt-5"
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Verify</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => signUp.verifications.sendEmailCode()}
                className="items-center mt-5"
              >
                <Text className="text-[#00AAA9] font-semibold">
                  Send a new code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => signUp.reset()}
                className="items-center mt-3"
              >
                <Text className="text-[#7C899B]">Start over</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }

  // ==================================================
  // SIGNUP SCREEN
  // ==================================================

  return (
    <View className="flex-1">
      <GradientBackground />
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: "transparent" }}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={Platform.OS === "ios" ? 24 : 40}
          keyboardOpeningTime={0}
        >
          <View className="flex-1 px-5 pt-6 z-10">
            {/* Logo */}
            <View className="items-center mt-1 debug-border">
              <Image
                source={require("../../assets/images/logo.png")}
                className="w-[52px] h-[52px]"
                resizeMode="contain"
              />

              <Text className="text-[24px] leading-[27px] font-extrabold text-[#071B49] mt-1">
                Docuniqo
              </Text>

              <Text className="text-[#00AAA9] text-[12px] font-medium mt-0.5">
                Smart Documents. Simplified.
              </Text>
            </View>

            {/* Heading */}
            <View className="items-center mt-4 mb-4">
              <Text className="text-[18px] font-bold text-[#071B49]">
                Create your account
              </Text>

              <Text className="text-[#78879A] text-[12px] mt-0.5">
                Sign up to get started with Docuniqo.
              </Text>
            </View>

            {/* =========================================
                  FULL NAME
                  ========================================= */}

            <View className="mb-2.5">
              <Text className="text-[#18233B] text-[12px] font-bold mb-1.5">
                Full Name
              </Text>

              <View
                className={`h-[46px] flex-row items-center bg-white rounded-xl border ${
                  formErrors.firstName || formErrors.lastName
                    ? "border-red-400"
                    : "border-[#E2EAF0]"
                }`}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#71809A"
                  style={{ marginLeft: 13, marginRight: 10 }}
                />

                <TextInput
                  className="flex-1 px-3 text-[13px]"
                  style={{ color: "#17233A" }}
                  cursorColor="#17233A"
                  selectionColor="#17233A"
                  placeholder="Enter your full name"
                  placeholderTextColor="#A0ACBA"
                  value={fullName}
                  onChangeText={onFullNameChange}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {(formErrors.firstName || formErrors.lastName) && (
                <Text className="text-red-500 text-[10px] mt-1 ml-1">
                  Please enter your full name
                </Text>
              )}
            </View>

            {/* =========================================
                  EMAIL
                  ========================================= */}

            <View className="mb-2.5">
              <Text className="text-[#18233B] text-[12px] font-bold mb-1.5">
                Email
              </Text>

              <View
                className={`h-[46px] flex-row items-center bg-white rounded-xl border ${
                  formErrors.email || errors.fields.emailAddress
                    ? "border-red-400"
                    : "border-[#E2EAF0]"
                }`}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#71809A"
                  style={{ marginLeft: 13, marginRight: 10 }}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      className="flex-1 px-3 text-[13px]"
                      style={{ color: "#17233A" }}
                      cursorColor="#17233A"
                      selectionColor="#17233A"
                      placeholder="Enter your email"
                      placeholderTextColor="#A0ACBA"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  )}
                />
              </View>

              {(formErrors.email || errors.fields.emailAddress) && (
                <Text className="text-red-500 text-[10px] mt-1 ml-1">
                  {formErrors.email?.message ||
                    errors.fields.emailAddress?.message ||
                    "Email is required"}
                </Text>
              )}
            </View>

            {/* =========================================
                  PASSWORD
                  ========================================= */}

            <View>
              <Text className="text-[#18233B] text-[12px] font-bold mb-1.5">
                Password
              </Text>

              <View
                className={`h-[46px] flex-row items-center bg-white rounded-xl border ${
                  formErrors.password || errors.fields.password
                    ? "border-red-400"
                    : "border-[#E2EAF0]"
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color="#71809A"
                  style={{ marginLeft: 13, marginRight: 10 }}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      className="flex-1 px-3 text-[13px]"
                      style={{ color: "#17233A" }}
                      cursorColor="#17233A"
                      selectionColor="#17233A"
                      placeholder="Create a password"
                      placeholderTextColor="#A0ACBA"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                    />
                  )}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="px-3"
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color="#71809A"
                  />
                </TouchableOpacity>
              </View>

              {(formErrors.password || errors.fields.password) && (
                <Text className="text-red-500 text-[10px] mt-1 ml-1">
                  {formErrors.password?.message ||
                    errors.fields.password?.message}
                </Text>
              )}

              {/* Live password requirement checklist */}
              <View className="flex-row flex-wrap mt-2">
                <RequirementCheck
                  met={hasMinLength}
                  label="At least 8 characters"
                />
                <RequirementCheck
                  met={hasUppercase}
                  label="Includes uppercase"
                />
                <RequirementCheck met={hasNumber} label="Includes number" />
              </View>
            </View>

            {/* =========================================
                  SIGN UP BUTTON
                  ========================================= */}

            <TouchableOpacity
              onPress={handleSubmit(onSignUpPress)}
              disabled={isLoading}
              activeOpacity={0.85}
              className="h-[46px] bg-[#08AAA9] rounded-xl items-center justify-center mt-4"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-[14px]">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            {/* =========================================
                  DIVIDER
                  ========================================= */}

            <View className="flex-row items-center my-3">
              <View className="flex-1 h-[1px] bg-[#E4EBF0]" />

              <Text className="mx-3 text-[#7D8998] text-[11px]">
                or continue with
              </Text>

              <View className="flex-1 h-[1px] bg-[#E4EBF0]" />
            </View>

            {/* =========================================
                  SOCIAL BUTTONS
                  UI ONLY — wire up onPress with your Clerk
                  OAuth flow (signUp.authenticateWithRedirect
                  or the strategy your Clerk version exposes).
                  ========================================= */}

            <View
              className="w-full flex-row justify-center items-center gap-3"
              style={{ marginTop: isVerySmallScreen ? 12 : 16 }}
            >
              {/* GOOGLE */}

              <TouchableOpacity
                onPress={onGoogleSignUpPress}
                disabled={isLoading}
                activeOpacity={0.8}
                className="w-full h-[52px] rounded-xl bg-white border border-[#E6ECF1] items-center justify-center"
              >
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/icons/google.png")}
                    className="w-5 h-5"
                    resizeMode="contain"
                  />

                  <Text className="ml-3 text-[#1A1D26] font-semibold">
                    Continue with Google
                  </Text>
                </View>
              </TouchableOpacity>

              {/* <TouchableOpacity
                            activeOpacity={0.8}
                            className="flex-1 max-w-[82px] h-[46px] rounded-xl bg-white border border-[#E6ECF1] items-center justify-center"
                          >
                            <Image
                              source={require("../../assets/icons/apple.png")}
                              className="w-[20px] h-[20px]"
                              resizeMode="contain"
                            />
                          </TouchableOpacity>
            
                          <TouchableOpacity
                            activeOpacity={0.8}
                            className="flex-1 max-w-[82px] h-[46px] rounded-xl bg-white border border-[#E6ECF1] items-center justify-center"
                          >
                            <Image
                              source={require("../../assets/icons/facebook.png")}
                              className="w-[20px] h-[20px]"
                              resizeMode="contain"
                            />
                          </TouchableOpacity> */}
            </View>

            {/* =========================================
                  SIGN IN
                  ========================================= */}

            <View className="flex-row justify-center mt-4 mb-3">
              <Text className="text-[#718096] text-[12px]">
                Already have an account?{" "}
              </Text>

              <Link href="/sign-in">
                <Text className="text-[#00A8A7] font-semibold text-[12px]">
                  Sign In
                </Text>
              </Link>
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Clerk CAPTCHA */}
        <View nativeID="clerk-captcha" />
      </SafeAreaView>
    </View>
  );
}
