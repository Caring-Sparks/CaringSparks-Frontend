"use client";

import { usePathname, useRouter } from "next/navigation";
import { Activity, Calendar, Users, UserSwitch } from "phosphor-react";
import { useEffect, useMemo, useState } from "react";
import { BiTrendingUp } from "react-icons/bi";
import { CgChevronRight } from "react-icons/cg";
import { useAdminUser } from "@/stores/adminStore";
import Image from "next/image";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("overview");

  // Get user data from store
  const { user, userLoading, clearUser } = useAdminUser();

  const menuItems = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        icon: Activity,
        route: "/admin",
      },
      {
        id: "influencers",
        label: "Influencers",
        icon: Users,
        route: "/admin/influencers",
      },
      {
        id: "brands",
        label: "Brands",
        icon: BiTrendingUp,
        route: "/admin/brands",
      },
      {
        id: "campaigns",
        label: "Campaigns",
        icon: Calendar,
        route: "/admin/campaigns",
      },
      {
        id: "managers",
        label: "Managers",
        icon: UserSwitch,
        route: "/admin/managers",
      },
    ],
    []
  );

  useEffect(() => {
    const found = menuItems.find((item) => pathname === item.route);
    if (found) {
      setActiveTab(found.id);
    } else {
      const foundNested = menuItems.find((item) =>
        pathname.startsWith(item.route + "/")
      );
      if (foundNested) {
        setActiveTab(foundNested.id);
      }
    }
  }, [pathname, menuItems]);

  // Get user initials for avatar
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "A";
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "Admin User";
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-md z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-black transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center">
                <Image src="/Logo.svg" width={100} height={50} alt="Logo" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">The•PR•God</h2>
                <p className="text-sm text-white">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.route);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? "txt border-s-2 border-txt bg-slate-200/20"
                      : "text-white hover:bg-slate-200/10"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <CgChevronRight size={16} className="ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Footer - User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            {userLoading ? (
              <div className="flex items-center space-x-3 px-4 py-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ) : user ? (
              <div className="space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-2">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getUserInitials(user.name, user.email)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-white truncate">{user.email}</p>
                    {user.role && (
                      <p className="text-xs txt font-medium">{user.role}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  ?
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Not signed in
                  </p>
                  <button
                    onClick={() => router.push("/")}
                    className="text-xs txt hover:text-yellow-700"
                  >
                    Click to login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
