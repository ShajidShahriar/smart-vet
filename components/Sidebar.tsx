import react from 'react';
export default function Sidebar(){
    return(
        <div className="w-64 h-screen bg-slate-950 text-white p-6 border-r border-slate-800">
        <h2 className="text-2xl font-bold mb-10 text-blue-500">SmartVet</h2>
        
        <nav className="flex flex-col gap-4">
            <a href="#" className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                📂 Dashboard
            </a>
            <a href="#" className="p-3 hover:bg-slate-900 rounded-lg transition text-gray-400">
                ⚙️ Settings
            </a>
            <a href="#" className="p-3 hover:bg-slate-900 rounded-lg transition text-gray-400">
                👤 Profile
            </a>
        </nav>
    </div>
    )
}