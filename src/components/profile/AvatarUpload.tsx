import { useState, useRef, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userId: string;
  onUploadComplete: () => Promise<void>;
}

const AvatarUpload = ({
  currentAvatarUrl,
  userId,
  onUploadComplete,
}: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user initials for avatar fallback
  const getInitials = () => {
    const name = userId.substring(0, 2).toUpperCase();
    return name;
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldFilePath = avatarUrl.split("/").pop();
        if (oldFilePath) {
          await supabase.storage.from("avatars").remove([`avatars/${oldFilePath}`]);
        }
      }

      setAvatarUrl(publicUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });

      // Refresh profile data
      await onUploadComplete();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;

    try {
      setIsUploading(true);

      // Update user profile to remove avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      // Delete avatar from storage
      const oldFilePath = avatarUrl.split("/").pop();
      if (oldFilePath) {
        await supabase.storage.from("avatars").remove([`avatars/${oldFilePath}`]);
      }

      setAvatarUrl(null);
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      });

      // Refresh profile data
      await onUploadComplete();
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} alt="Profile" />
        <AvatarFallback className="text-lg bg-indigo-100 text-indigo-800">
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {avatarUrl ? "Change" : "Upload"}
        </Button>

        {avatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AvatarUpload;