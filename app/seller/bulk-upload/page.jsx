'use client'
import React, { useState } from 'react';
import axios from 'axios';
import { useAppContext } from '@/context/AppContext';

const BulkUploadPanel = () => {
    const { showToast } = useAppContext();
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { getToken } = useAppContext();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== "application/json" && !file.name.endsWith(".json")) {
                showToast("Invalid file formatting layout. Please provide a standard .json file extension document.", "error");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

      const token = await getToken();
      if (!token) {
        toast.error('Unable to get auth token. Please sign in again.');
        return;
      }

        setIsUploading(true);
        const submissionPayload = new FormData();
        submissionPayload.append("file", selectedFile);
        //submissionPayload.append("userId", currentSellerId); // Appends the verified identification key string

        try {
            const { data } = await axios.post("/api/product/bulk-import", submissionPayload, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" ,Authorization: `Bearer ${token}`}
            });


            if (data.success) {
                showToast(data.message, "success");
                setSelectedFile(null); // Clear selected state hook configuration metrics upon success
            } else {
                showToast(data.message, "error");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to parse database insertion batch streams.";
            showToast(errorMsg, "error");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-xl w-full mx-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-10 text-xs font-semibold text-gray-500">
            <div className="flex flex-col items-start border-b border-gray-100 pb-3 mb-5">
                <h2 className="text-gray-900 font-bold text-base tracking-tight flex items-center gap-1.5">
                    <span>📦</span> Bulk Product Catalog Import Workspace
                </h2>
                <p className="text-gray-400 font-medium mt-0.5">Upload a structured `products.json` file dataset to inject dozens of new inventory lines instantly.</p>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-5">
                {/* Drag-and-drop active visual box mask */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 bg-gray-50/50 hover:bg-gray-50 transition relative">
                    <span className="text-3xl select-none">📄</span>
                    <div className="space-y-0.5 text-center">
                        <p className="text-gray-900 font-bold text-xs">
                            {selectedFile ? selectedFile.name : "Select your application dataset JSON file"}
                        </p>
                        <p className="text-gray-400 font-medium">
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : "File bounds strictly limited to .json extension format tags only"}
                        </p>
                    </div>
                    <input 
                        type="file" 
                        accept=".json"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed" 
                    />
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-orange-800 leading-relaxed font-medium space-y-1">
                    <p className="font-bold text-orange-950 text-xs">💡 Data Upload Structural Guidelines:</p>
                    <p>The import engine automatically validates and filters incoming entries against active records. If a product code matches an item already saved in MongoDB, that row is safely skipped to protect database index integrity.</p>
                </div>

                {/* Import Submission Action button */}
                <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className={`w-full py-3 text-white font-bold text-center rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 ${
                        isUploading || !selectedFile
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed shadow-none"
                            : "bg-orange-600 hover:bg-orange-700 active:bg-orange-800 cursor-pointer"
                    }`}
                >
                    {isUploading ? "Uploading Batch Records..." : "Execute Bulk Import Script"}
                </button>
            </form>
        </div>
    );
};

export default BulkUploadPanel;
