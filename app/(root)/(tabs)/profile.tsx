import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#16AFA9",
  dark: "#0B1736",
  background: "#F8FAFC",
  border: "#E7ECF2",
  muted: "#64748B",
  lightMuted: "#94A3B8",
  white: "#FFFFFF",
  danger: "#EF4444",
};

type EditType = "name" | "username" | "email" | "phone" | null;

type ContactType = "email" | "phone";

export default function Profile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [editType, setEditType] = useState<EditType>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  const [contactValue, setContactValue] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [contactObject, setContactObject] = useState<any>(undefined);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC] px-6">
        <Text className="text-center text-base text-[#64748B]">
          You need to be signed in to view your profile.
        </Text>
      </View>
    );
  }

  const displayName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "Docuniqo User";

  const email = user.primaryEmailAddress?.emailAddress || "No email added";

  const phone = user.primaryPhoneNumber?.phoneNumber || "No phone number added";

  const usernameValue = user.username ? `@${user.username}` : "No username";

  // -------------------------------------------------------
  // OPEN EDIT
  // -------------------------------------------------------

  const openEdit = (type: EditType) => {
    setErrorMessage("");
    setIsVerifying(false);
    setVerificationCode("");

    if (type === "name") {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }

    if (type === "username") {
      setUsername(user.username || "");
    }

    if (type === "email" || type === "phone") {
      setContactValue("");
    }

    setEditType(type);
  };

  // -------------------------------------------------------
  // CLOSE MODAL
  // -------------------------------------------------------

  const closeModal = () => {
    if (isSaving) return;

    setEditType(null);
    setIsVerifying(false);
    setVerificationCode("");
    setContactValue("");
    setContactObject(undefined);
    setErrorMessage("");
  };

  // -------------------------------------------------------
  // UPDATE NAME
  // -------------------------------------------------------

  const updateName = async () => {
    if (!firstName.trim() && !lastName.trim()) {
      setErrorMessage("Please enter at least a first or last name.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      await user.reload();

      closeModal();
    } catch (error: any) {
      console.error("Name update failed:", error);

      setErrorMessage(
        error?.errors?.[0]?.longMessage ||
          error?.message ||
          "Unable to update your name.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------
  // UPDATE USERNAME
  // -------------------------------------------------------

  const updateUsername = async () => {
    const cleanUsername = username.trim().replace(/^@/, "");

    if (!cleanUsername) {
      setErrorMessage("Please enter a username.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await user.update({
        username: cleanUsername,
      });

      await user.reload();

      closeModal();
    } catch (error: any) {
      console.error("Username update failed:", error);

      setErrorMessage(
        error?.errors?.[0]?.longMessage ||
          error?.message ||
          "Unable to update your username.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------
  // CHANGE PROFILE IMAGE
  // -------------------------------------------------------

  const changeProfileImage = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "User information is not available.");
        return;
      }

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to change your profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) {
        return;
      }

      setIsSaving(true);

      const asset = result.assets[0];

      const mimeType = asset.mimeType || "image/jpeg";

      const imageData = `data:${mimeType};base64,${asset.base64}`;

      await user.setProfileImage({
        file: imageData,
      });

      await user.reload();

      Alert.alert("Success", "Your profile picture has been updated.");
    } catch (error: any) {
      console.error("Profile image update failed:", error);

      Alert.alert(
        "Couldn't update photo",
        error?.message || "Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------
  // CREATE EMAIL / PHONE
  // -------------------------------------------------------

  const startContactChange = async (type: ContactType) => {
    if (!contactValue.trim()) {
      setErrorMessage(
        type === "email"
          ? "Please enter an email address."
          : "Please enter a phone number.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      if (type === "email") {
        const newEmail = await user.createEmailAddress({
          email: contactValue.trim(),
        });

        await user.reload();

        const emailObject = user.emailAddresses.find(
          (item) => item.id === newEmail.id,
        );

        if (!emailObject) {
          throw new Error("Unable to create the email address.");
        }

        await emailObject.prepareVerification({
          strategy: "email_code",
        });

        setContactObject(emailObject);
        setIsVerifying(true);
      }

      if (type === "phone") {
        const newPhone = await user.createPhoneNumber({
          phoneNumber: contactValue.trim(),
        });

        await user.reload();

        const phoneObject = user.phoneNumbers.find(
          (item) => item.id === newPhone.id,
        );

        if (!phoneObject) {
          throw new Error("Unable to create the phone number.");
        }

        await phoneObject.prepareVerification();

        setContactObject(phoneObject);
        setIsVerifying(true);
      }
    } catch (error: any) {
      console.error("Contact update failed:", error);

      setErrorMessage(
        error?.errors?.[0]?.longMessage ||
          error?.message ||
          "Unable to start verification.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------
  // VERIFY EMAIL / PHONE
  // -------------------------------------------------------

  const verifyContact = async () => {
    if (!verificationCode.trim()) {
      setErrorMessage("Please enter the verification code.");
      return;
    }

    if (!contactObject) {
      setErrorMessage("Verification session expired. Please try again.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const result = await contactObject.attemptVerification({
        code: verificationCode.trim(),
      });

      if (result.verification?.status !== "verified") {
        setErrorMessage("The verification code is not valid.");
        return;
      }

      if (editType === "email") {
        await user.update({
          primaryEmailAddressId: contactObject.id,
        });
      }

      if (editType === "phone") {
        await user.update({
          primaryPhoneNumberId: contactObject.id,
        });
      }

      await user.reload();

      closeModal();
    } catch (error: any) {
      console.error("Verification failed:", error);

      setErrorMessage(
        error?.errors?.[0]?.longMessage ||
          error?.message ||
          "Verification failed. Please check the code and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-14"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="mb-7">
          <Text className="text-[28px] font-bold text-[#0B1736]">Profile</Text>

          <Text className="mt-1 text-sm text-[#64748B]">
            Manage your Docuniqo account
          </Text>
        </View>

        {/* PROFILE CARD */}
        <View className="rounded-2xl border border-[#E7ECF2] bg-white p-5">
          <View className="items-center">
            {/* PROFILE IMAGE */}
            <View className="relative">
              {/* PROFILE IMAGE - TAP TO VIEW */}
              <TouchableOpacity
                onPress={() => setIsImageViewerVisible(true)}
                activeOpacity={0.9}
                className="h-24 w-24 overflow-hidden rounded-full"
              >
                {user.imageUrl ? (
                  <Image
                    source={{
                      uri: user.imageUrl,
                    }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center rounded-full bg-[#E5F7F6]">
                    <Ionicons
                      name="person-outline"
                      size={40}
                      color={COLORS.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>

              {/* EDIT IMAGE BUTTON */}
              <TouchableOpacity
                onPress={changeProfileImage}
                disabled={isSaving}
                activeOpacity={0.8}
                className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#16AFA9]"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="create-outline" size={17} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            <Text className="mt-4 text-xl font-bold text-[#0B1736]">
              {displayName}
            </Text>

            <Text className="mt-1 text-sm text-[#64748B]">{email}</Text>

            {user.username && (
              <View className="mt-3 rounded-full bg-[#E8F8F7] px-3 py-1.5">
                <Text className="text-xs font-semibold text-[#0F8884]">
                  @{user.username}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={changeProfileImage}
              disabled={isSaving}
              activeOpacity={0.8}
              className="mt-4 flex-row items-center"
            >
              <Ionicons name="image-outline" size={16} color={COLORS.primary} />

              <Text className="ml-2 text-sm font-semibold text-[#16AFA9]">
                Change profile photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PERSONAL INFORMATION */}
        <SectionTitle title="Personal information" />

        <View className="overflow-hidden rounded-2xl border border-[#E7ECF2] bg-white">
          <ProfileRow
            icon="person-outline"
            label="Full name"
            value={displayName}
            onPress={() => openEdit("name")}
          />

          <Divider />

          <ProfileRow
            icon="at-outline"
            label="Username"
            value={usernameValue}
            onPress={() => openEdit("username")}
            isLast
          />
        </View>

        {/* CONTACT INFORMATION */}
        <SectionTitle title="Contact information" />

        <View className="overflow-hidden rounded-2xl border border-[#E7ECF2] bg-white">
          <ProfileRow
            icon="mail-outline"
            label="Email address"
            value={email}
            onPress={() => openEdit("email")}
          />

          <Divider />

          <ProfileRow
            icon="call-outline"
            label="Phone number"
            value={phone}
            onPress={() => openEdit("phone")}
            isLast
          />
        </View>

        {/* ACCOUNT */}
        <SectionTitle title="Account" />

        <View className="overflow-hidden rounded-2xl border border-[#E7ECF2] bg-white">
          <View className="flex-row items-center px-4 py-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F0F4F8]">
              <Ionicons
                name="finger-print-outline"
                size={20}
                color={COLORS.dark}
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-[#0B1736]">
                Account ID
              </Text>

              <Text numberOfLines={1} className="mt-1 text-xs text-[#64748B]">
                {user.id}
              </Text>
            </View>
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          className="mt-7 h-12 items-center justify-center rounded-xl border border-[#FECACA] bg-white"
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />

            <Text className="ml-2 text-sm font-bold text-[#EF4444]">
              Log out
            </Text>
          </View>
        </TouchableOpacity>

        <Text className="mt-5 text-center text-xs text-[#94A3B8]">
          Your profile information is securely managed by Clerk.
        </Text>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={editType !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/40"
        >
          <View className="max-h-[90%] rounded-t-[28px] bg-white px-5 pb-8 pt-4">
            {/* HANDLE */}
            <View className="mb-5 items-center">
              <View className="h-1.5 w-12 rounded-full bg-[#D8DEE7]" />
            </View>

            {/* MODAL HEADER */}
            <View className="mb-6 flex-row items-center">
              <View className="flex-1">
                <Text className="text-xl font-bold text-[#0B1736]">
                  {editType === "name" && "Edit your name"}

                  {editType === "username" && "Edit username"}

                  {editType === "email" &&
                    (isVerifying
                      ? "Verify your email"
                      : "Change email address")}

                  {editType === "phone" &&
                    (isVerifying ? "Verify your phone" : "Change phone number")}
                </Text>

                <Text className="mt-1 text-sm text-[#64748B]">
                  {editType === "name" &&
                    "Update the name shown on your profile."}

                  {editType === "username" &&
                    "Choose a unique username for your account."}

                  {editType === "email" &&
                    (isVerifying
                      ? "Enter the code sent to your new email."
                      : "A verification code will be sent to your new email.")}

                  {editType === "phone" &&
                    (isVerifying
                      ? "Enter the code sent to your phone."
                      : "A verification code will be sent to your phone.")}
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeModal}
                disabled={isSaving}
                className="h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9]"
              >
                <Ionicons name="close" size={21} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            {/* ERROR */}
            {errorMessage ? (
              <View className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
                <Text className="text-sm leading-5 text-[#DC2626]">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* NAME */}
            {editType === "name" && (
              <View>
                <InputLabel text="First name" />

                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter first name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  className="h-12 rounded-xl border border-[#DDE4EC] bg-[#F8FAFC] px-4 text-base text-[#0B1736]"
                />

                <InputLabel text="Last name" />

                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter last name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  className="h-12 rounded-xl border border-[#DDE4EC] bg-[#F8FAFC] px-4 text-base text-[#0B1736]"
                />

                <SaveButton
                  label="Save changes"
                  loading={isSaving}
                  onPress={updateName}
                />
              </View>
            )}

            {/* USERNAME */}
            {editType === "username" && (
              <View>
                <InputLabel text="Username" />

                <View className="flex-row items-center rounded-xl border border-[#DDE4EC] bg-[#F8FAFC]">
                  <Text className="pl-4 text-base font-semibold text-[#64748B]">
                    @
                  </Text>

                  <TextInput
                    value={username.replace(/^@/, "")}
                    onChangeText={setUsername}
                    placeholder="username"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="h-12 flex-1 px-2 text-base text-[#0B1736]"
                  />
                </View>

                <Text className="mt-2 text-xs leading-5 text-[#94A3B8]">
                  Your username must be available in your Clerk instance.
                </Text>

                <SaveButton
                  label="Save username"
                  loading={isSaving}
                  onPress={updateUsername}
                />
              </View>
            )}

            {/* EMAIL */}
            {editType === "email" && (
              <View>
                {!isVerifying ? (
                  <>
                    <InputLabel text="New email address" />

                    <TextInput
                      value={contactValue}
                      onChangeText={setContactValue}
                      placeholder="you@example.com"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      className="h-12 rounded-xl border border-[#DDE4EC] bg-[#F8FAFC] px-4 text-base text-[#0B1736]"
                    />

                    <SaveButton
                      label="Send verification code"
                      loading={isSaving}
                      onPress={() => startContactChange("email")}
                    />
                  </>
                ) : (
                  <>
                    <View className="mb-5 rounded-xl bg-[#E8F8F7] px-4 py-3">
                      <Text className="text-sm leading-5 text-[#0F7774]">
                        We sent a verification code to{" "}
                        <Text className="font-bold">{contactValue}</Text>
                      </Text>
                    </View>

                    <InputLabel text="Verification code" />

                    <TextInput
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                      className="h-12 rounded-xl border border-[#DDE4EC] bg-[#F8FAFC] px-4 text-center text-lg font-semibold tracking-[4px] text-[#0B1736]"
                    />

                    <SaveButton
                      label="Verify email"
                      loading={isSaving}
                      onPress={verifyContact}
                    />
                  </>
                )}
              </View>
            )}

            {/* PHONE */}
            {editType === "phone" && (
              <View>
                {!isVerifying ? (
                  <>
                    <InputLabel text="New phone number" />

                    <TextInput
                      value={contactValue}
                      onChangeText={setContactValue}
                      placeholder="+91 9876543210"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      className="h-12 rounded-xl border border-[#DDE4EC] bg-[#F8FAFC] px-4 text-base text-[#0B1736]"
                    />

                    <Text className="mt-2 text-xs leading-5 text-[#94A3B8]">
                      Use international format, for example +91XXXXXXXXXX.
                    </Text>

                    <SaveButton
                      label="Send verification code"
                      loading={isSaving}
                      onPress={() => startContactChange("phone")}
                    />
                  </>
                ) : (
                  <>
                    <View className="mb-5 rounded-xl bg-[#E8F8F7] px-4 py-3">
                      <Text className="text-sm leading-5 text-[#0F7774]">
                        We sent a verification code to{" "}
                        <Text className="font-bold">{contactValue}</Text>
                      </Text>
                    </View>

                    <InputLabel text="Verification code" />

                    <TextInput
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                      className="h-12 rounded-xl border border-[#DDE4EC] bg-[#F8FAFC] px-4 text-center text-lg font-semibold tracking-[4px] text-[#0B1736]"
                    />

                    <SaveButton
                      label="Verify phone"
                      loading={isSaving}
                      onPress={verifyContact}
                    />
                  </>
                )}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={isImageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black">
          {/* CLOSE BUTTON */}
          <TouchableOpacity
            onPress={() => setIsImageViewerVisible(false)}
            activeOpacity={0.8}
            className="absolute right-5 top-14 z-10 h-11 w-11 items-center justify-center rounded-full bg-black/60"
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* FULL-SCREEN IMAGE */}
          {user.imageUrl ? (
            <Image
              source={{
                uri: user.imageUrl,
              }}
              className="h-full w-full"
              resizeMode="contain"
            />
          ) : (
            <View className="items-center justify-center">
              <View className="h-36 w-36 items-center justify-center rounded-full bg-[#E5F7F6]">
                <Ionicons
                  name="person-outline"
                  size={70}
                  color={COLORS.primary}
                />
              </View>

              <Text className="mt-4 text-base font-medium text-white">
                No profile picture
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

// -------------------------------------------------------
// SECTION TITLE
// -------------------------------------------------------

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="mb-2 mt-7 px-1 text-xs font-bold uppercase tracking-[1px] text-[#64748B]">
      {title}
    </Text>
  );
}

// -------------------------------------------------------
// DIVIDER
// -------------------------------------------------------

function Divider() {
  return <View className="ml-[68px] h-px bg-[#EEF2F6]" />;
}

// -------------------------------------------------------
// PROFILE ROW
// -------------------------------------------------------

function ProfileRow({
  icon,
  label,
  value,
  onPress,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4"
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E8F8F7]">
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-[#0B1736]">{label}</Text>

        <Text numberOfLines={1} className="mt-1 pr-2 text-xs text-[#64748B]">
          {value}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

// -------------------------------------------------------
// INPUT LABEL
// -------------------------------------------------------

function InputLabel({ text }: { text: string }) {
  return (
    <Text className="mb-2 mt-1 text-sm font-semibold text-[#0B1736]">
      {text}
    </Text>
  );
}

// -------------------------------------------------------
// SAVE BUTTON
// -------------------------------------------------------

function SaveButton({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
      className={`mt-6 h-12 items-center justify-center rounded-xl ${
        loading ? "bg-[#8BD8D5]" : "bg-[#16AFA9]"
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className="text-sm font-bold text-white">{label}</Text>
      )}
    </TouchableOpacity>
  );
}
