import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import LoginModal from "./Auth/LoginModal";
import SignupModal from "./Auth/SignupModal";

export default function Header(){
  const [openLogin,setOpenLogin]=useState(false);
  const [openSignup,setOpenSignup]=useState(false);

  const navBase="inline-flex items-center gap-1 text-[13px] text-[#a97979] hover:text-[#7a5050] transition-colors";
  const navActive=({isActive})=>`${navBase} ${isActive?"text-[#7a5050] font-medium underline underline-offset-4":""}`;

  return (
    <header className="w-full bg-white">
      {/* top menu */}
      <div className="container-7xl flex items-center justify-between px-4 py-2">
        <nav className="flex items-center gap-5">
          <NavLink to="/" className={navActive}>🏠 Home</NavLink>
          <NavLink to="/contact" className={navActive}>📩 Contact</NavLink>
          <NavLink to="/subscription" className={navActive}>🧾 Subscription</NavLink>
        </nav>
        <nav className="hidden items-center gap-5 sm:flex">
          <span className={navBase}>📞 Phone</span>
          <span className={navBase}>✉️ Email</span>
          <a className={navBase} href="https://instagram.com">📷 Instagram</a>
        </nav>
        <button
          onClick={()=>setOpenLogin(true)}
          className="ml-4 rounded-full bg-[#c98383] px-4 py-1.5 text-[13px] font-semibold text-white shadow hover:bg-[#b97878]"
        >Login</button>
      </div>

      {/* brand row */}
      <div className="border-y">
        <div className="container-7xl flex items-center justify-center px-4 py-5">
          <Link to="/" className="select-none">
            <span className="text-4xl font-semibold tracking-[0.15em] text-rose-300">appt</span>
            <span className="text-4xl font-semibold tracking-[0.15em] text-neutral-600">.live</span>
          </Link>
        </div>
      </div>

      {/* modals */}
      <LoginModal
        open={openLogin}
        onClose={()=>setOpenLogin(false)}
        onSwitch={()=>{setOpenLogin(false); setOpenSignup(true);}}
      />
      <SignupModal
        open={openSignup}
        onClose={()=>setOpenSignup(false)}
        onSwitch={()=>{setOpenSignup(false); setOpenLogin(true);}}
      />
    </header>
  );
}
