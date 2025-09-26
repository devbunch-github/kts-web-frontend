export default function Modal({open,onClose,title,children}){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-center w-full text-[20px] font-semibold text-rose-500">{title}</h3>
          <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-rose-100 px-2 py-1 text-rose-500">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
