"use client";

import { Badge, Button, cn } from "@cronkwaters/ui";
import { Inbox, X, Hash, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";

import WaveformMini from "./WaveformMini";

const ACCEPT_EXTENSIONS = [".wav", ".aiff", ".mp3", ".flac", ".txt"];
const ACCEPT_ATTRIBUTE = ACCEPT_EXTENSIONS.join(",");

type UploadEntry = {
  id: string;
  name: string;
  size: number;
  type: string;
  checksum: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
  error?: string;
  assetId?: string;
};

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return "0 B";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const toKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

interface UploadDropzoneProps {
  projectId?: string;
}

export function UploadDropzone({ projectId }: UploadDropzoneProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const humanAcceptList = useMemo(
    () => ACCEPT_EXTENSIONS.map((ext) => ext.replace(".", "").toUpperCase()).join(", "),
    [],
  );

  const computeChecksum = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer)).map((byte) =>
      byte.toString(16).padStart(2, "0"),
    );
    return hashArray.join("").slice(0, 8);
  }, []);

  const addFiles = useCallback(
    async (fileList: FileList | File[] | null) => {
      if (!fileList) return;
      if (entries.length >= 10) return;
      const files = Array.from(fileList).filter((file) =>
        ACCEPT_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext)),
      );
      if (!files.length) return;

      const remaining = Math.max(10 - entries.length, 0);
      const limited = files.slice(0, remaining);

      const existingKeys = new Set(entries.map((entry) => entry.id));
      const newEntries: UploadEntry[] = [];
      for (const file of limited) {
        const key = toKey(file);
        if (existingKeys.has(key)) continue;
        const checksum = await computeChecksum(file);
        newEntries.push({
          id: key,
          name: file.name,
          size: file.size,
          type: file.type || "Unknown",
          checksum,
          file,
          status: "pending",
        });
        existingKeys.add(key);
      }
      if (newEntries.length) {
        setEntries((prev) => [...newEntries, ...prev]);
      }
    },
    [computeChecksum, entries],
  );

  const handleInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await addFiles(event.target.files);
      event.target.value = "";
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      await addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setDragActive(false);
  }, []);

  const removeEntry = useCallback(
    (id: string) => setEntries((prev) => prev.filter((entry) => entry.id !== id)),
    [],
  );

  const openFileDialog = useCallback(() => inputRef.current?.click(), []);

  const uploadFile = useCallback(
    async (entry: UploadEntry) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: "uploading", progress: 0 } : e)),
      );

      try {
        const formData = new FormData();
        formData.append("file", entry.file);
        formData.append("name", entry.name);
        if (projectId) {
          formData.append("projectId", projectId);
        }

        const response = await fetch("/api/upload-audio", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? { ...e, status: "success", progress: 100, assetId: data.asset?.id }
              : e,
          ),
        );
      } catch (error) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? {
                  ...e,
                  status: "error",
                  error: error instanceof Error ? error.message : "Upload failed",
                }
              : e,
          ),
        );
      }
    },
    [projectId],
  );

  const uploadAll = useCallback(async () => {
    setIsUploading(true);
    const pendingEntries = entries.filter((e) => e.status === "pending");

    // Upload files in parallel (max 3 at a time)
    const uploadPromises = [];
    for (let i = 0; i < pendingEntries.length; i += 3) {
      const batch = pendingEntries.slice(i, i + 3);
      uploadPromises.push(...batch.map((entry) => uploadFile(entry)));
      if (i + 3 < pendingEntries.length) {
        await Promise.all(uploadPromises);
        uploadPromises.length = 0;
      }
    }
    await Promise.all(uploadPromises);

    setIsUploading(false);

    // Refresh the page after a short delay to show the new assets
    setTimeout(() => {
      router.refresh();
    }, 1500);
  }, [entries, uploadFile, router]);

  const clearCompleted = useCallback(() => {
    setEntries((prev) => prev.filter((e) => e.status !== "success"));
  }, []);

  const hasFiles = entries.length > 0;
  const hasPending = entries.some((e) => e.status === "pending");
  const hasSuccess = entries.some((e) => e.status === "success");

  return (
    <section className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFileDialog();
          }
        }}
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-border/60 bg-surface/80 focus-visible:outline-brand-primary relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-16 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
          dragActive && "border-brand-primary bg-brand-primary/5",
        )}
        aria-label="Upload audio or lyric files"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="bg-brand-primary/10 text-brand-primary flex h-16 w-16 items-center justify-center rounded-full">
          <Inbox className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="text-brand-foreground mt-6 text-xl font-semibold">
          Drag files here or click to browse
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Accepted formats: {humanAcceptList}. Files stay local until you confirm uploads with your
          team.
        </p>
        <p className="text-brand-muted-foreground mt-4 text-xs uppercase tracking-[0.3em]">
          Max 10 files per batch
        </p>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="border-border/50 bg-surface/80 text-muted-foreground rounded-2xl border px-6 py-8 text-center text-sm">
            Your selected files will appear here with a quick checksum before syncing to storage.
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className={cn(
                    "shadow-soft flex flex-col gap-4 rounded-2xl border px-6 py-5 transition",
                    entry.status === "success" && "border-green-500/40 bg-green-50/50",
                    entry.status === "error" && "border-red-500/40 bg-red-50/50",
                    entry.status === "uploading" && "border-brand-primary/60 bg-brand-primary/5",
                    entry.status === "pending" &&
                      "border-border/60 bg-surface hover:border-brand-primary/40 hover:shadow-md",
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-2 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-brand-foreground truncate text-sm font-medium"
                          title={entry.name}
                        >
                          {entry.name}
                        </span>
                        <Badge variant="outline" className="uppercase">
                          {entry.type ? (entry.type.split("/").pop() ?? entry.type) : "File"}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {formatBytes(entry.size)}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="font-mono uppercase" aria-label="Checksum">
                          {entry.checksum}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.status === "pending" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-brand-foreground self-start text-xs"
                          onClick={() => removeEntry(entry.id)}
                        >
                          <X className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Remove
                        </Button>
                      )}
                      {entry.status === "uploading" && (
                        <Badge variant="outline" className="animate-pulse">
                          Uploading...
                        </Badge>
                      )}
                      {entry.status === "success" && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Uploaded
                        </Badge>
                      )}
                      {entry.status === "error" && (
                        <Badge variant="danger" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                  {entry.file.type.startsWith("audio/") ? <WaveformMini file={entry.file} /> : null}
                  {entry.status === "error" && entry.error && (
                    <p className="mt-1 text-xs text-red-600">{entry.error}</p>
                  )}
                </li>
              ))}
            </ul>

            {hasFiles && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-muted-foreground text-sm">
                  {entries.filter((e) => e.status === "success").length} of {entries.length} files
                  uploaded
                </div>
                <div className="flex items-center gap-2">
                  {hasSuccess && (
                    <Button variant="ghost" size="sm" onClick={clearCompleted}>
                      Clear Uploaded
                    </Button>
                  )}
                  {hasPending && (
                    <Button size="sm" onClick={uploadAll} disabled={isUploading}>
                      {isUploading ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload All ({entries.filter((e) => e.status === "pending").length})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
