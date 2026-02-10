"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  deleteAccount,
  updatePreferences,
} from "@/app/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { BookingCard } from "@/components/BookingCard";

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "actions">("details");
  const [message, setMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Dialog states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    eventReminders: true,
    newsletter: false,
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "", // Read-only usually
    bio: "",
    birthday: "",
    gender: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    website: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.email) {
      fetchProfile();
    }

    // Check for "tab" parameter
    const tab = searchParams.get("tab");
    if (tab === "actions" || tab === "details") {
      setActiveTab(tab);
    }

    // Check for success parameter from booking redirect
    const success = searchParams.get("success");

    if (success === "true") {
      setShowSuccessNotification(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowSuccessNotification(false), 5000);
      // Clean URL
      window.history.replaceState({}, "", "/profile?tab=details");
      return () => clearTimeout(timer);
    }
  }, [session, status, router, searchParams]);

  useEffect(() => {

  }, [activeTab, session?.user?.email]);

  const fetchProfile = async () => {
    setLoading(true);
    const result = await getUserProfile();
    if (result.data) {
      const profileData = result.data as typeof result.data & {
        preferences?: {
          emailNotifications?: boolean;
          pushNotifications?: boolean;
          eventReminders?: boolean;
          newsletter?: boolean;
        };
      };

      setProfile(profileData);
      populateForm(profileData);

      // Load preferences if they exist
      if (profileData.preferences) {
        setPreferences({
          emailNotifications:
            profileData.preferences.emailNotifications ?? true,
          pushNotifications: profileData.preferences.pushNotifications ?? false,
          eventReminders: profileData.preferences.eventReminders ?? true,
          newsletter: profileData.preferences.newsletter ?? false,
        });
      }
    }
    // If no profile found in DB, we rely on session data for basic display
    setLoading(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const populateForm = (data: any) => {
    setFormData({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      phone: data.phoneNumber || "",
      email: data.email || session?.user?.email || "",
      bio: data.bio || "",
      birthday: data.birthday
        ? new Date(data.birthday).toISOString().split("T")[0]
        : "",
      gender: data.gender || "",
      instagram: data.socialLinks?.instagram || "",
      linkedin: data.socialLinks?.linkedin || "",
      twitter: data.socialLinks?.twitter || "",
      website: data.socialLinks?.website || "",
    });
  };

  // Calculate profile completion percentage - updates in real-time
  const profileCompletion = useMemo(() => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.phone,
      formData.bio,
      formData.birthday,
      formData.gender,
      profile?.profile_picture_url,
    ];
    const filledFields = fields.filter(
      (field) => field && field.toString().trim() !== "",
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  }, [formData, profile?.profile_picture_url]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formPayload.append(key, value);
    });

    const result = await updateProfile(null, formPayload);
    if (result?.success) {
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile(); // Refresh
      // Trigger navbar refresh
      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } else {
      setMessage("Failed to update profile.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const formPayload = new FormData();
    formPayload.append("currentPassword", passwordForm.currentPassword);
    formPayload.append("newPassword", passwordForm.newPassword);
    formPayload.append("confirmPassword", passwordForm.confirmPassword);

    const result = await changePassword(formPayload);
    if (result.success) {
      setMessage("Password changed successfully!");
      setShowPasswordDialog(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setMessage(result.message || "Failed to change password");
    }
  };

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setMessage("Please select a photo");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("profilePicture", photoFile);

    const result = await uploadProfilePicture(formPayload);
    if (result.success) {
      setMessage("Profile picture updated successfully!");
      setShowPhotoDialog(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      fetchProfile();
      // Trigger navbar refresh
      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } else {
      setMessage(result.message || "Failed to upload photo");
    }
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formPayload = new FormData();
    formPayload.append(
      "emailNotifications",
      preferences.emailNotifications.toString(),
    );
    formPayload.append(
      "pushNotifications",
      preferences.pushNotifications.toString(),
    );
    formPayload.append("eventReminders", preferences.eventReminders.toString());
    formPayload.append("newsletter", preferences.newsletter.toString());

    const result = await updatePreferences(formPayload);
    if (result.success) {
      setMessage("Preferences updated successfully!");
      setShowPreferencesDialog(false);
    } else {
      setMessage(result.message || "Failed to update preferences");
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const formPayload = new FormData();
    formPayload.append("confirmation", deleteConfirmation);

    const result = await deleteAccount(formPayload);
    if (result.success) {
      signOut({ callbackUrl: "/" });
    } else {
      setMessage(result.message || "Failed to delete account");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-acid font-mono">
        Loading Profile...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-obsidian text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-noise">
      <div className="max-w-4xl mx-auto">
        {/* Success Notification Banner */}
        {showSuccessNotification && (
          <div className="mb-6 bg-gradient-to-r from-acid/20 to-green-500/20 border border-acid/30 rounded-2xl p-6 shadow-2xl shadow-acid/10 animate-in slide-in-from-top duration-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-acid/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-acid"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-acid mb-1">
                  🎉 Booking Confirmed!
                </h3>
                <p className="text-gray-300 text-sm">
                  Your event has been successfully booked.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border ${message.includes("success")
              ? "bg-green-500/20 text-green-400 border-green-500/20"
              : "bg-red-500/20 text-red-400 border-red-500/20"
              }`}
          >
            <div className="flex items-center justify-between">
              <span>{message}</span>
              <button
                onClick={() => setMessage("")}
                className="text-current hover:opacity-70"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / User Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl p-6 text-center border-white/10 relative overflow-hidden">
              <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white/5 shadow-xl">
                <AvatarImage
                  src={profile?.profile_picture_url || session.user?.image}
                  alt={formData.firstName}
                />
                <AvatarFallback className="bg-white/10 text-4xl text-acid">
                  {formData.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold font-display">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-zinc-500 text-sm mb-4">
                {profile?.email || session.user?.email}
              </p>
              {formData.bio && (
                <p className="text-gray-400 text-sm italic mb-6 line-clamp-3">
                  "{formData.bio}"
                </p>
              )}

              {/* Profile Completion Progress */}
              <div className="mb-6 px-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Profile Completion
                  </span>
                  <span className="text-sm font-bold text-acid">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-acid to-green-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                {profileCompletion < 100 && (
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    Complete your profile to unlock all features
                  </p>
                )}
                {profileCompletion === 100 && (
                  <p className="text-[10px] text-acid mt-2 text-center font-semibold">
                    ✓ Profile Complete!
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-3">
                {formData.instagram && (
                  <a
                    href={formData.instagram}
                    target="_blank"
                    className="text-zinc-400 hover:text-acid transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      public
                    </span>
                  </a>
                )}
                {/* Icons can be added here properly */}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 grid gap-2">
                <Button
                  variant={activeTab === "details" ? "outline" : "ghost"}
                  className={`w-full justify-start ${activeTab === "details" ? "bg-white/10 text-acid" : ""}`}
                  onClick={() => setActiveTab("details")}
                >
                  <span className="material-symbols-outlined mr-2 text-lg">
                    person
                  </span>{" "}
                  Profile Details
                </Button>

                <Button
                  variant={activeTab === "actions" ? "outline" : "ghost"}
                  className={`w-full justify-start ${activeTab === "actions" ? "bg-white/10 text-acid" : ""}`}
                  onClick={() => setActiveTab("actions")}
                >
                  <span className="material-symbols-outlined mr-2 text-lg">
                    settings
                  </span>{" "}
                  Actions & Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2">
            {activeTab === "details" ? (
              <div className="glass-card p-8 rounded-2xl border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white font-display">
                    Personal Information
                  </h2>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-acid text-black hover:bg-acid-hover"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                {message && (
                  <div
                    className={`p-3 rounded mb-4 text-sm ${message.includes("success") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-zinc-400">First Name</Label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Last Name</Label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Email</Label>
                      <Input
                        name="email"
                        value={formData.email}
                        disabled={true}
                        className="bg-white/5 border-white/10 text-zinc-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Phone</Label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Date of Birth</Label>
                      <Input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/10 text-white scheme-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Gender</Label>
                      <CustomSelect
                        options={[
                          { value: "male", label: "Male" },
                          { value: "female", label: "Female" },
                          { value: "other", label: "Other" },
                          {
                            value: "prefer_not_to_say",
                            label: "Prefer not to say",
                          },
                        ]}
                        value={formData.gender}
                        onChange={(val) =>
                          setFormData((prev) => ({ ...prev, gender: val }))
                        }
                        disabled={!isEditing}
                        placeholder="Select Gender"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-zinc-400">Bio</Label>
                      <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/10 text-white min-h-[100px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Social Links Section */}
                    <div className="md:col-span-2 pt-4 border-t border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4">
                        Social Links
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          name="instagram"
                          placeholder="Instagram URL"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/10"
                        />
                        <Input
                          name="linkedin"
                          placeholder="LinkedIn URL"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/10"
                        />
                        <Input
                          name="twitter"
                          placeholder="Twitter/X URL"
                          value={formData.twitter}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/10"
                        />
                        <Input
                          name="website"
                          placeholder="Personal Website URL"
                          value={formData.website}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-acid text-black hover:bg-acid-hover font-bold"
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              <div className="glass-card p-8 rounded-2xl border-white/10 space-y-6">
                <h2 className="text-2xl font-bold text-white font-display mb-6">
                  Account Actions
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-white">Change Password</h4>
                      <p className="text-sm text-zinc-500">
                        Update your security credentials
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      Update
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-white">Upload New Photo</h4>
                      <p className="text-sm text-zinc-500">
                        Change your public avatar
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                      onClick={() => setShowPhotoDialog(true)}
                    >
                      Upload
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-white">Preferences</h4>
                      <p className="text-sm text-zinc-500">
                        Manage notifications and usage
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                      onClick={() => setShowPreferencesDialog(true)}
                    >
                      Manage
                    </Button>
                  </div>

                  <div className="my-6 border-t border-white/10"></div>

                  <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10 hover:bg-red-500/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-red-500">Sign Out</h4>
                      <p className="text-sm text-zinc-500">
                        Log out of your current session
                      </p>
                    </div>
                    <Button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Sign Out
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10 hover:bg-red-500/10 transition-colors opacity-80 hover:opacity-100">
                    <div>
                      <h4 className="font-bold text-red-500">Delete Account</h4>
                      <p className="text-sm text-zinc-500">
                        Permanently remove your data
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="bg-obsidian border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Change Password
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Update your account password
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Current Password</Label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordDialog(false)}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-acid text-black hover:bg-acid-hover"
                >
                  Update Password
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Upload Photo Dialog */}
        <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
          <DialogContent className="bg-obsidian border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Upload Profile Picture
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Choose a new profile picture (max 5MB)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePhotoUpload} className="space-y-4">
              <div className="space-y-4">
                {photoPreview && (
                  <div className="flex justify-center">
                    <Avatar className="w-32 h-32 border-4 border-white/10">
                      <AvatarImage src={photoPreview} alt="Preview" />
                    </Avatar>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-zinc-300">Choose File</Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="bg-white/5 border-white/10 file:text-white file:bg-white/10 file:border-0"
                    required
                  />
                  <p className="text-xs text-zinc-500">
                    Accepted formats: JPEG, PNG, WebP
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPhotoDialog(false);
                    setPhotoPreview(null);
                    setPhotoFile(null);
                  }}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-acid text-black hover:bg-acid-hover"
                >
                  Upload Photo
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Preferences Dialog */}
        <Dialog
          open={showPreferencesDialog}
          onOpenChange={setShowPreferencesDialog}
        >
          <DialogContent className="bg-obsidian border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Notification Preferences
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Manage your notification settings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePreferencesUpdate} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-zinc-300">Email Notifications</Label>
                    <p className="text-xs text-zinc-500">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-zinc-300">Push Notifications</Label>
                    <p className="text-xs text-zinc-500">
                      Browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-zinc-300">Event Reminders</Label>
                    <p className="text-xs text-zinc-500">
                      Get reminders for bookmarked events
                    </p>
                  </div>
                  <Switch
                    checked={preferences.eventReminders}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        eventReminders: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-zinc-300">Newsletter</Label>
                    <p className="text-xs text-zinc-500">
                      Monthly event highlights
                    </p>
                  </div>
                  <Switch
                    checked={preferences.newsletter}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, newsletter: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreferencesDialog(false)}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-acid text-black hover:bg-acid-hover"
                >
                  Save Preferences
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-obsidian border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-500">
                Delete Account
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                This action cannot be undone. All your data will be permanently
                removed.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Type <span className="font-bold text-red-500">DELETE</span> to
                  confirm
                </Label>
                <Input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="bg-white/5 border-white/10"
                  placeholder="DELETE"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteConfirmation("");
                  }}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={deleteConfirmation !== "DELETE"}
                >
                  Delete Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-acid font-mono">
        Loading...
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
