"use client";
import React, { useState } from "react";
import pdfToText from "react-pdftotext";
export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(" CLICK DETECTED. Files:", e.target.files);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      console.log("STATE UPDATED with:", e.target.files[0].name);
    }
  };

  const handleUpload = async () => {

    if (!file) return;


    setUploading(true);

    try {
      const text = await pdfToText(file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          text: text
        })
      });


      const result = await response.json();


      if (result.success) {

        alert("Success! Check your VS Code Terminal.");
      } else {
        alert("Error: " + result.error);
      }

    } catch (error) {
      alert("Something went wrong!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <label
        htmlFor="resume-upload"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {file ? (
            <>
              <p className="text-green-500 font-bold text-xl">✅ File Selected!</p>
              <p className="text-gray-400 mt-2">{file.name}</p>
            </>
          ) : (
            <>
              <p className="mb-2 text-2xl">📄</p>
              <p className="text-sm text-gray-400">Click to upload resume (PDF)</p>
            </>
          )}
        </div>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`mt-6 w-full py-3 rounded-lg font-bold transition ${uploading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
            }`}
        >
          {uploading ? "Analyzing..." : `Analyze ${file.name}`}
        </button>
      )}
    </div>
  );
}