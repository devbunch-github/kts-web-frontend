import Modal from "../Modal";
import { apiLogin } from "../../api/publicApi";
import { useState } from "react";

export default function LoginModal({open,onClose, onSwitch }){
  const [form,setForm]=useState({name:"",email:"",remember:false,agree:false});
  const submit=async(e)=>{ e.preventDefault(); await apiLogin({email:form.email}); onClose(); };
  return (
    <Modal open={open} onClose={onClose} title="Login">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Full Name" value={form.name} onChange={v=>setForm(s=>({...s,name:v}))}/>
        <Field label="Email" type="email" value={form.email} onChange={v=>setForm(s=>({...s,email:v}))}/>
        <div className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.remember} onChange={e=>setForm(s=>({...s,remember:e.target.checked}))}/> Remember me
          <span className="ml-auto text-rose-500 text-xs">Forgot Password</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <input type="checkbox" checked={form.agree} onChange={e=>setForm(s=>({...s,agree:e.target.checked}))}/>
          By login you agree to our <span className="text-rose-500">Terms of use</span> our <span className="text-rose-500">Privacy Policy</span>
        </div>
        <button className="mt-2 w-full rounded-lg bg-rose-400 py-2.5 text-white">Login</button>
        <div className="text-center text-xs">
            Don’t have an account?{" "}
            <button type="button" onClick={onSwitch} className="text-rose-500 underline decoration-dotted">
                Signup
            </button>
        </div>
      </form>
    </Modal>
  );
}
function Field({label,value,onChange,type="text"}){return(<div><label className="mb-1 block text-sm">{label}</label><input className="w-full rounded-lg border px-3 py-2 text-sm" type={type} value={value} onChange={e=>onChange(e.target.value)}/></div>)}
