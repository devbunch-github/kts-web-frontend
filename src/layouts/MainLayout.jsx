import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      {/* Header always on top */}
      <Header />

      {/* Main content area */}
      <main className="bg-white min-h-screen">
        <Outlet />
      </main>

      {/* Footer always at bottom */}
      <Footer />
    </>
  );
}
