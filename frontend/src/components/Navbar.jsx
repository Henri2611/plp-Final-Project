const Navbar = () => (
  <header className="bg-white border-b border-slate-200 shadow-sm">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <div>
        <p className="text-xs uppercase text-slate-400 tracking-[0.3em]">
          Radiology Suite
        </p>
        <h1 className="text-2xl font-semibold text-slate-800">
          Pneumonia Detection
        </h1>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-slate-600">Dr. Henri Ouma</p>
        <p className="text-xs text-slate-400">Pulmonology • 08:30 AM</p>
      </div>
    </div>
  </header>
);

export default Navbar;

