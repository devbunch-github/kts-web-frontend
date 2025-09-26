import Header from "../components/Header";
import Footer from "../components/Footer";
import { postContact } from "../api/publicApi";
import { useState } from "react";

export default function ContactPage(){
  const [form,setForm]=useState({first_name:"",last_name:"",email:"",phone_code:"UK",phone:"",message:"",agree:false});
  const [ok,setOk]=useState("");

  const submit=async(e)=>{e.preventDefault(); const r=await postContact({...form,agree:!!form.agree}); setOk(r.message||"Thanks!"); setForm({first_name:"",last_name:"",email:"",phone_code:"UK",phone:"",message:"",agree:false});};

  return (
    <div className="min-h-screen bg-white">
      <Header/>
      <section className="relative h-[260px] md:h-[320px] bg-cover bg-center" style={{backgroundImage:"url(/images/hero-1.jpg)"}}>
        <div className="absolute inset-0 bg-black/40"/>
        <div className="relative z-10 container-7xl flex h-full items-end px-4 pb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Contact Us</h1>
        </div>
      </section>

      <section className="container-7xl section-pad">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-rose-400 text-sm font-medium">Contact us</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold">Get in touch</h2>
          <p className="mt-2 text-sm text-neutral-600">We’d love to hear from you. Please fill out this form.</p>
          {ok && <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-emerald-700">{ok}</div>}
        </div>

        <form onSubmit={submit} className="mx-auto mt-8 w-full max-w-2xl space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="First name" value={form.first_name} onChange={v=>setForm(s=>({...s,first_name:v}))}/>
            <Input label="Last name"  value={form.last_name}  onChange={v=>setForm(s=>({...s,last_name:v}))}/>
          </div>
          <Input label="Email" type="email" value={form.email} onChange={v=>setForm(s=>({...s,email:v}))}/>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Phone number</label>
            <div className="flex gap-2">
              <select className="w-28 rounded-lg border px-3 py-2 text-sm" value={form.phone_code} onChange={e=>setForm(s=>({...s,phone_code:e.target.value}))}>
                <option>UK</option><option>US</option><option>PK</option>
              </select>
              <input className="flex-1 rounded-lg border px-3 py-2 text-sm" placeholder="+44 (555) 000-0000" value={form.phone} onChange={e=>setForm(s=>({...s,phone:e.target.value}))}/>
            </div>
          </div>
          <TextArea label="Message" rows={5} value={form.message} onChange={v=>setForm(s=>({...s,message:v}))}/>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={form.agree} onChange={e=>setForm(s=>({...s,agree:e.target.checked}))}/>
            Do you agree to our <span className="text-rose-500 underline decoration-dotted">Terms of use</span> our <span className="text-rose-500 underline decoration-dotted">Privacy Policy</span>
          </label>

          <button className="w-full rounded-lg bg-rose-400 py-3 text-white font-medium hover:bg-rose-500">Send message</button>
        </form>
      </section>
      <Footer/>
    </div>
  );
}
function Input({label,value,onChange,type="text"}){return(<div><label className="mb-1 block text-sm text-neutral-700">{label}</label><input type={type} className="w-full rounded-lg border px-3 py-2 text-sm" value={value} onChange={e=>onChange(e.target.value)} /></div>)}
function TextArea({label,value,onChange,rows=4}){return(<div><label className="mb-1 block text-sm text-neutral-700">{label}</label><textarea rows={rows} className="w-full rounded-lg border px-3 py-2 text-sm" value={value} onChange={e=>onChange(e.target.value)}/></div>)}
