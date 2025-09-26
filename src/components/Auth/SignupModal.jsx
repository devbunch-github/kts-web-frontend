import Modal from "../Modal";
import { apiRegister } from "../../api/publicApi";
import { useState } from "react";

export default function SignupModal({open,onClose, onSwitch }){
  const [f,setF]=useState({name:"",business_name:"",email:"",phone:"",agree:false});
  const submit=async(e)=>{e.preventDefault(); await apiRegister(f); onClose();}
  return (
    <Modal open={open} onClose={onClose} title="Sign up">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Full Name" value={f.name} onChange={v=>setF(s=>({...s,name:v}))}/>
        <Field label="Business Name" value={f.business_name} onChange={v=>setF(s=>({...s,business_name:v}))}/>
        <Field label="Email" type="email" value={f.email} onChange={v=>setF(s=>({...s,email:v}))}/>
        <Field label="Mobile Number" value={f.phone} onChange={v=>setF(s=>({...s,phone:v}))}/>
        {/* uploaders (UI only) */}
        <div className="grid grid-cols-2 gap-3">
          <UploadBox label="Upload Logo"/>
          <UploadBox label="Upload Cover Image"/>
        </div>
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input type="checkbox" checked={f.agree} onChange={e=>setF(s=>({...s,agree:e.target.checked}))}/>
          By sign up you agree to our <span className="text-rose-500">Terms of use</span> our <span className="text-rose-500">Privacy Policy</span>
        </label>
        <button className="w-full rounded-lg bg-rose-400 py-2.5 text-white">Sign up</button>
        <div className="text-center text-xs">
            Already have an account?{" "}
            <button type="button" onClick={onSwitch} className="text-rose-500 underline decoration-dotted">
                Login
            </button>
        </div>
      </form>
    </Modal>
  );
}
function Field({label,value,onChange,type="text"}){return(<div><label className="mb-1 block text-sm">{label}</label><input className="w-full rounded-lg border px-3 py-2 text-sm" type={type} value={value} onChange={e=>onChange(e.target.value)}/></div>)}
function UploadBox({label}){return(<div className="rounded-lg border p-4 text-center text-xs text-neutral-500"><div className="rounded-md border px-4 py-6">Drag & drop</div><div className="mt-2">{label}</div></div>)}
