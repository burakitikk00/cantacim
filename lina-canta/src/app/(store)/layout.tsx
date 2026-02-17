import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <div className="min-h-screen">{children}</div>
            <Footer />
        </>
    );
}
