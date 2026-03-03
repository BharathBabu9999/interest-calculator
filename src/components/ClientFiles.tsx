import { useState, useEffect, useRef, useCallback } from "react";
import { filesApi, type ClientFile } from "../api/files";

interface ClientFilesProps {
  clientId: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FileTypeIcon({ mimetype }: { mimetype: string }) {
  if (mimetype === "application/pdf")
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className="text-xs font-semibold text-red-400 tracking-widest uppercase">PDF</span>
      </div>
    );
  if (mimetype.includes("excel") || mimetype.includes("spreadsheet") || mimetype === "text/csv")
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <span className="text-xs font-semibold text-green-500 tracking-widest uppercase">
          {mimetype === "text/csv" ? "CSV" : "Excel"}
        </span>
      </div>
    );
  if (mimetype.includes("word"))
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-xs font-semibold text-blue-500 tracking-widest uppercase">Word</span>
      </div>
    );
  if (mimetype.includes("powerpoint") || mimetype.includes("presentation"))
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className="text-xs font-semibold text-orange-500 tracking-widest uppercase">PPT</span>
      </div>
    );
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <svg className="w-12 h-12 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 tracking-widest uppercase">File</span>
    </div>
  );
}

interface FileCardProps {
  file: ClientFile;
  thumbUrl?: string;
  onDownload: (file: ClientFile) => void;
  onDelete: (id: string) => void;
  onDescriptionSave: (id: string, desc: string) => Promise<void>;
  downloading: boolean;
  deleting: boolean;
}

function FileCard({ file, thumbUrl, onDownload, onDelete, onDescriptionSave, downloading, deleting }: FileCardProps) {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(file.description ?? "");
  const [savingDesc, setSavingDesc] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingDesc) textareaRef.current?.focus();
  }, [editingDesc]);

  const startEdit = () => {
    setDescDraft(file.description ?? "");
    setEditingDesc(true);
  };

  const saveDesc = async () => {
    setSavingDesc(true);
    try {
      await onDescriptionSave(file.id, descDraft);
      setEditingDesc(false);
    } finally {
      setSavingDesc(false);
    }
  };

  const cancelEdit = () => {
    setDescDraft(file.description ?? "");
    setEditingDesc(false);
  };

  const isImage = file.mimetype.startsWith("image/");

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      {/* Preview area */}
      <div className="h-40 bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden">
        {isImage ? (
          thumbUrl ? (
            <img
              src={thumbUrl}
              alt={file.original_filename}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="w-8 h-8 animate-spin text-gray-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )
        ) : (
          <FileTypeIcon mimetype={file.mimetype} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-4 gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate" title={file.original_filename}>
            {file.original_filename}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            {formatBytes(file.size)} · {formatDateTime(file.created_at)}
          </p>
        </div>

        {/* Description */}
        <div className="flex-1">
          {editingDesc ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEdit();
                  if (e.key === "Enter" && e.ctrlKey) saveDesc();
                }}
                rows={3}
                placeholder="Add a description…"
                className="w-full text-xs bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-800 dark:text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveDesc}
                  disabled={savingDesc}
                  className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md px-2.5 py-1 transition-colors"
                >
                  {savingDesc ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white rounded-md px-2.5 py-1 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startEdit}
              className="w-full text-left group"
            >
              {file.description ? (
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed line-clamp-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {file.description}
                </p>
              ) : (
                <p className="text-xs text-gray-300 dark:text-slate-600 italic group-hover:text-gray-400 dark:group-hover:text-slate-500 transition-colors">
                  + Add description
                </p>
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/60">
          <button
            onClick={() => onDownload(file)}
            disabled={downloading}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 transition-colors"
          >
            {downloading ? "…" : "↓ Download"}
          </button>
          <button
            onClick={() => onDelete(file.id)}
            disabled={deleting}
            className="text-xs font-medium text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientFiles({ clientId }: ClientFilesProps) {
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbUrlsRef = useRef<Record<string, string>>({});

  // Load thumbnails for image files
  const loadThumbnail = useCallback(async (file: ClientFile) => {
    if (!file.mimetype.startsWith("image/")) return;
    if (thumbUrlsRef.current[file.id]) return;
    try {
      const blob = await filesApi.fetchBlob(file.id);
      const url = URL.createObjectURL(blob);
      thumbUrlsRef.current[file.id] = url;
      setThumbUrls((prev) => ({ ...prev, [file.id]: url }));
    } catch {
      // ignore thumbnail load errors
    }
  }, []);

  useEffect(() => {
    filesApi
      .list(clientId)
      .then((data) => {
        setFiles(data);
        data.forEach(loadThumbnail);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    return () => {
      Object.values(thumbUrlsRef.current).forEach(URL.revokeObjectURL);
    };
  }, [clientId, loadThumbnail]);

  const upload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(fileList)) {
        const created = await filesApi.upload(clientId, file);
        setFiles((prev) => [...prev, created]);
        loadThumbnail(created);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this file? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      await filesApi.delete(id);
      if (thumbUrlsRef.current[id]) {
        URL.revokeObjectURL(thumbUrlsRef.current[id]);
        delete thumbUrlsRef.current[id];
        setThumbUrls((prev) => { const n = { ...prev }; delete n[id]; return n; });
      }
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (file: ClientFile) => {
    setDownloadingId(file.id);
    setError(null);
    try {
      await filesApi.download(file.id, file.original_filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDescriptionSave = async (id: string, description: string) => {
    const updated = await filesApi.updateDescription(id, description.trim() || null);
    setFiles((prev) => prev.map((f) => (f.id === id ? updated : f)));
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Documents & Files</h3>
          {files.length > 0 && (
            <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-full px-2 py-0.5">
              {files.length}
            </span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      <div className="p-6">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all mb-6 ${
            dragOver
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]"
              : "border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/30"
          }`}
        >
          <svg className="w-7 h-7 mx-auto mb-2 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Drop files here or <span className="text-blue-600 dark:text-blue-400 font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Images · PDF · Word · Excel · PowerPoint · CSV &nbsp;·&nbsp; Max 20 MB each
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-4 py-2.5 text-sm mb-4">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">Loading files…</p>
        )}

        {!loading && files.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-2">No files attached yet.</p>
        )}

        {files.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                thumbUrl={thumbUrls[file.id]}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onDescriptionSave={handleDescriptionSave}
                downloading={downloadingId === file.id}
                deleting={deletingId === file.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
