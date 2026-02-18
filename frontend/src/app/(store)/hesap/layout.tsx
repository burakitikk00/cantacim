import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-primary flex items-start">
            {/* Sidebar is sticky on desktop, allowing it to scroll with content but respect footer boundary */}
            <div className="hidden lg:block sticky top-20 h-[calc(100vh-5rem)] z-40 w-72 shrink-0 overflow-y-auto no-scrollbar">
                <ProfileSidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 px-6 pb-6 pt-24 lg:px-12 lg:pb-12 lg:pt-32 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
