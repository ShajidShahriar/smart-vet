import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload"; // <--- Import the new brick

export default function Home() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <Sidebar />

      <main className="flex-1 p-10 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold mb-2">SmartVet</h1>
        <p className="text-gray-400 mb-10">AI-Powered Resume Screening</p>
        
        {/* Replace the old div with your new Component */}
        <FileUpload /> 

      </main>
    </div>
  );}
