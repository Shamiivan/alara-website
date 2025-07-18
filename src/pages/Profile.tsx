import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, CreditCard, Settings, LogOut } from "lucide-react";
import ProfileForm from "@/components/profile/ProfileForm";
import AvatarUpload from "@/components/profile/AvatarUpload";
import PaymentHistory from "@/components/profile/PaymentHistory";

const Profile = () => {
  const { user, profile, signOut, isLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url || null}
                    userId={user?.id || ''}
                    onUploadComplete={refreshProfile}
                  />
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900">
                      {profile?.full_name || user?.email}
                    </h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("billing")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={signOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and how we can contact you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm
                      profile={profile}
                      onProfileUpdate={refreshProfile}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription & Billing</CardTitle>
                    <CardDescription>
                      Manage your subscription and view payment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium">Current Plan</h3>
                        <div className="mt-2 p-4 bg-indigo-50 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-indigo-800">Alara Monthly</p>
                              <p className="text-sm text-indigo-600">$9/month</p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => navigate("/subscription")}
                            >
                              Manage Subscription
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium">Payment History</h3>
                        <div className="mt-2">
                          <PaymentHistory userId={user?.id || ''} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Configure which emails you want to receive
                        </p>
                        {/* Email notification settings will be implemented later */}
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">
                            Email notification settings coming soon
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Permanently delete your account and all of your content
                        </p>
                        <div className="mt-4">
                          <Button variant="destructive">Delete Account</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;