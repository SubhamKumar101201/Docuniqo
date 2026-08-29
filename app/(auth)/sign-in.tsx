import { useSignIn, useSSO } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as AuthSession from "expo-auth-session";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { GradientBackground } from "@/components/GradientBackground";
import { codeSchema, SignInFormValues, signInSchema } from "@/lib/schemas/auth";

// ==================================================
// Preloads the browser for Android devices to reduce authentication load time
export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  useWarmUpBrowser();

  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const { height, width } = useWindowDimensions();

  const isSmallScreen = height < 700;
  const isVerySmallScreen = height < 650;

  const [showPassword, setShowPassword] = useState(false);

  // ============================================
  // SIGN IN FORM
  // ============================================

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ============================================
  // MFA FORM
  // ============================================

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

  const isLoading = fetchStatus === "fetching";

  // ============================================
  // SIGN IN
  // ============================================

  const onSignInPress = async (values: SignInFormValues) => {
    const { error } = await signIn.password({
      emailAddress: values.email,
      password: values.password,
    });

    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;

          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      await signIn.mfa.sendPhoneCode();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  // =========================================
  // GOOGLE SIGN IN
  // =========================================

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onGoogleSignInPress = async () => {
    setIsGoogleLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "docuniqo",
          path: "/",
        }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(root)/(tabs)");
      } else {
        // no session came back — shouldn't normally happen for you, but don't fail silently
        console.warn("No session created after Google sign-in");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", JSON.stringify(error, null, 2));
    } finally {
      setIsGoogleLoading(false);
    }
  };
  // const onGoogleSignInPress = async () => {
  //   try {
  //     const { createdSessionId, setActive } = await startSSOFlow({
  //       strategy: "oauth_google",
  //     });

  //     if (createdSessionId && setActive) {
  //       await setActive({
  //         session: createdSessionId,
  //       });

  //       router.replace("/");
  //     }
  //   } catch (error) {
  //     console.error("Google Sign-In Error:", error);
  //   }
  // };

  // ============================================
  // VERIFY MFA
  // ============================================

  const onVerifyPress = async ({ code }: { code: string }) => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;

          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  // ============================================
  // MFA SCREEN
  // ============================================

  if (signIn.status === "needs_client_trust") {
    return (
      // <SafeAreaView className="flex-1 bg-white">
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
        <View className="flex-1 justify-center px-6 bg-white">
          <View
            className="bg-white rounded-[28px] p-6"
            style={{
              shadowColor: "#0B1736",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.08,
              shadowRadius: 18,
              elevation: 5,
            }}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              resizeMode="contain"
              style={{
                width: 70,
                height: 70,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <Text className="text-[#0B1736] text-[25px] font-bold mb-2">
              Verify your account
            </Text>

            <Text className="text-[#7D8798] text-[14px] leading-5 mb-6">
              Enter the verification code sent to your email.
            </Text>

            <Controller
              control={codeControl}
              name="code"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  className="h-[52px] border border-[#E2E8EF] bg-white rounded-xl px-4"
                  style={{ color: "#0B1736" }}
                  cursorColor="#0B1736"
                  selectionColor="#0B1736"
                  placeholder="Enter verification code"
                  placeholderTextColor="#A1AAB8"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                />
              )}
            />

            {codeErrors.code && (
              <Text className="text-red-500 text-xs mt-2">
                {codeErrors.code.message}
              </Text>
            )}

            {errors.fields.code && (
              <Text className="text-red-500 text-xs mt-2">
                {errors.fields.code.message}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleCodeSubmit(onVerifyPress)}
              disabled={isLoading}
              activeOpacity={0.85}
              className="h-[52px] bg-[#16AFA9] rounded-xl items-center justify-center mt-5"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-[15px]">Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signIn.mfa.sendEmailCode()}
              className="items-center mt-5"
            >
              <Text className="text-[#16AFA9] text-sm font-semibold">
                I need a new code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signIn.reset()}
              className="items-center mt-3"
            >
              <Text className="text-[#7D8798] text-sm">Start over</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
      // {/* </SafeAreaView> */}
    );
  }

  // ============================================
  // MAIN SIGN-IN SCREEN
  // ============================================

  return (
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
      <View className="flex-1 bg-white">
        {/* ========================================
              TOP ILLUSTRATION
          ======================================== */}

        <View
          className="items-center justify-center"
          style={{
            height: isVerySmallScreen
              ? height * 0.26
              : isSmallScreen
                ? height * 0.3
                : height * 0.32,
          }}
        >
          <Image
            source={require("../../assets/images/onboarding/onboarding-scan-doc-person.png")}
            resizeMode="contain"
            style={{ width: width * 0.8, height: "100%" }}
          />
        </View>

        {/* ========================================
              LOGIN CARD
          ======================================== */}

        <View
          className="flex-1 bg-white rounded-t-[28px] border border-[#DCE6EA] shadow-xl shadow-[#0B1736]/10 elevation-5 overflow-hidden"
          style={{
            marginTop: isVerySmallScreen ? -5 : -18,
            shadowColor: "#0B1736",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.05,
            shadowRadius: 15,
            elevation: 4,
          }}
        >
          <GradientBackground />
          <View
            className="flex-1"
            style={{
              paddingHorizontal: width < 360 ? 18 : 22,
              paddingTop: isVerySmallScreen ? 16 : 20,
            }}
          >
            {/* Heading */}
            <Text
              className="text-[#0B1736] font-bold"
              style={{
                fontSize: width < 360 ? 18 : 19,
                lineHeight: width < 360 ? 23 : 25,
              }}
            >
              Welcome back! 👋
            </Text>

            <Text
              className="text-[#7D8798]"
              style={{
                fontSize: width < 360 ? 12 : 13,
                lineHeight: 18,
                marginTop: 4,
              }}
            >
              Sign in to continue and manage your documents easily.
            </Text>

            {/* =========================================
                  EMAIL
                  ========================================= */}

            <View style={{ marginTop: isVerySmallScreen ? 14 : 18 }}>
              <Text className="text-[#0B1736] text-[12px] font-bold mb-1.5">
                Email
              </Text>

              <View
                className={`h-[46px] flex-row items-center bg-white rounded-xl border ${
                  formErrors.email || errors.fields.identifier
                    ? "border-red-400"
                    : "border-[#E2E8EF]"
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
                      style={{ color: "#0B1736" }}
                      cursorColor="#0B1736"
                      selectionColor="#0B1736"
                      placeholder="Enter your email"
                      placeholderTextColor="#A1AAB8"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  )}
                />
              </View>

              {(formErrors.email || errors.fields.identifier) && (
                <Text className="text-red-500 text-[10px] mt-1 ml-1">
                  {formErrors.email?.message ||
                    errors.fields.identifier?.message}
                </Text>
              )}
            </View>

            {/* =========================================
                  PASSWORD
                  ========================================= */}

            <View style={{ marginTop: 10 }}>
              <Text className="text-[#0B1736] text-[12px] font-bold mb-1.5">
                Password
              </Text>

              <View
                className={`h-[46px] flex-row items-center bg-white rounded-xl border ${
                  formErrors.password || errors.fields.password
                    ? "border-red-400"
                    : "border-[#E2E8EF]"
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
                      style={{ color: "#0B1736" }}
                      cursorColor="#0B1736"
                      selectionColor="#0B1736"
                      placeholder="Enter your password"
                      placeholderTextColor="#A1AAB8"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                    />
                  )}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
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
            </View>

            {/* Forgot password */}
            <TouchableOpacity activeOpacity={0.7} className="self-end mt-2">
              <Text className="text-[#16AFA9] font-semibold text-[11px]">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign in button */}
            <TouchableOpacity
              onPress={handleSubmit(onSignInPress)}
              disabled={isLoading}
              activeOpacity={0.85}
              className="h-[46px] bg-[#16AFA9] rounded-xl items-center justify-center"
              style={{ marginTop: isVerySmallScreen ? 12 : 16 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-bold text-[14px]">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View
              className="flex-row items-center"
              style={{ marginTop: isVerySmallScreen ? 12 : 16 }}
            >
              <View className="flex-1 h-[1px] bg-[#E8EDF1]" />
              <Text className="text-[#8A94A3] px-3 text-[11px]">
                or continue with
              </Text>
              <View className="flex-1 h-[1px] bg-[#E8EDF1]" />
            </View>

            {/* Social buttons */}
            <View
              className="w-full flex-row justify-center items-center gap-3"
              style={{ marginTop: isVerySmallScreen ? 12 : 16 }}
            >
              {/* GOOGLE */}

              <TouchableOpacity
                onPress={onGoogleSignInPress}
                disabled={isLoading}
                activeOpacity={0.8}
                className="w-full h-[52px] rounded-xl bg-white border border-[#E6ECF1] items-center justify-center"
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
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
                )}
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

            {/* Sign up link */}
            <View
              className="flex-row justify-center items-center mb-2"
              style={{ marginTop: isVerySmallScreen ? 14 : 18 }}
            >
              <Text className="text-[#7D8798] text-[11px]">
                Don&apos;t have an account?{" "}
              </Text>

              <Link href="/sign-up">
                <Text className="text-[#16AFA9] font-semibold text-[11px]">
                  Sign Up
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
