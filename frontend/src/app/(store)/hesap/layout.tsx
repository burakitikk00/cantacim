import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { MobileSidebarWrapper } from "@/components/profile/MobileSidebarWrapper";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-primary flex items-start">
            {/* Main Layout containing Mobile & Desktop Sidebars */}
            <div className="flex-1 px-4 lg:px-12 pb-6 lg:pb-12 pt-24 lg:pt-32 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-0 lg:gap-12">

                {/* Sidebar controlled by wrapper */}
                <MobileSidebarWrapper>
                    <ProfileSidebar />
                </MobileSidebarWrapper>

                {/* Main Content */}
                <main className="flex-1 w-full min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
