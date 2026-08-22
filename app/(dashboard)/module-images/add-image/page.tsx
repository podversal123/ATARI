"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImagePlus, Info, Trash2, UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
  MODULE_IMAGE_CATEGORIES,
  MODULE_IMAGE_REPORTING_YEARS,
} from "@/lib/module-images";
import { useSession } from "@/lib/session";

type PendingImage = { id: string; previewUrl: string; caption: string; uploadDate: string };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * KVK — Add Image (Module Images UI.pdf, "ADD IMAGE UI"): pick the
 * Category/Form this photograph belongs to (auto-linked to Form Management
 * per spec section 12, not free text), Reporting Year, Date of Activity,
 * then upload one or more images each with a mandatory caption (spec
 * section 15 — Add to List is blocked unless both are present) before
 * Save & Submit. Uploaded images live in local component state only —
 * there is no backend/storage yet, so nothing here is actually persisted.
 */
export default function AddModuleImagePage() {
  return (
    <Suspense fallback={null}>
      <AddModuleImageForm />
    </Suspense>
  );
}

function AddModuleImageForm() {
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();
  const presetCategory = searchParams.get("category") ?? "";

  const [categoryPath, setCategoryPath] = useState(
    MODULE_IMAGE_CATEGORIES.some((c) => c.path === presetCategory) ? presetCategory : ""
  );
  const [reportingYear, setReportingYear] = useState(MODULE_IMAGE_REPORTING_YEARS[0]);
  const [activityDate, setActivityDate] = useState(today());

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedImages, setUploadedImages] = useState<PendingImage[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  function handleFileChange(file: File | null) {
    setFileError(null);
    if (!file) {
      setPendingFile(null);
      setPendingPreviewUrl(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Allowed file types: JPG, JPEG, PNG.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setFileError(`Max file size: ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    setPendingFile(file);
    setPendingPreviewUrl(URL.createObjectURL(file));
  }

  function addToList() {
    // Mandatory-pair rule (spec section 15): neither an image without a caption nor a caption without an image may be added.
    if (!pendingFile || !pendingPreviewUrl) {
      setFileError("Select an image to add.");
      return;
    }
    if (caption.trim() === "") {
      setFormError("Caption is mandatory for each image.");
      return;
    }
    setFormError(null);
    setUploadedImages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), previewUrl: pendingPreviewUrl, caption: caption.trim(), uploadDate: today() },
    ]);
    setPendingFile(null);
    setPendingPreviewUrl(null);
    setCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeUploaded(id: string) {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  }

  function handleSubmit() {
    if (!categoryPath) {
      setFormError("Select a Category / Form first.");
      return;
    }
    if (uploadedImages.length === 0) {
      setFormError("Add at least one photograph before submitting.");
      return;
    }
    setFormError(null);
    // No backend/storage yet — nothing to persist until Phase 2/3.
    router.push("/module-images");
  }

  const isKvk = session.role !== "super-admin";
  const categoryLabel = MODULE_IMAGE_CATEGORIES.find((c) => c.path === categoryPath)?.label;

  return (
    <div>
      <PageHeader
        backHref="/module-images"
        trail={[{ label: "Module Images", href: "/module-images" }, { label: "Add Image" }]}
        title="Add Image"
        icon={ImagePlus}
        description={isKvk ? `Uploading for ${session.kvkName ?? "your KVK"}.` : undefined}
      />

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <Info className="size-3.5" />
            Image Details
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                Category / Form <span className="text-destructive">*</span>
              </Label>
              <select
                value={categoryPath}
                onChange={(e) => setCategoryPath(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
              >
                <option value="">Select category / form</option>
                {MODULE_IMAGE_CATEGORIES.map((leaf) => (
                  <option key={leaf.path} value={leaf.path}>
                    {leaf.groupLabel} — {leaf.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Reporting Year <span className="text-destructive">*</span>
              </Label>
              <select
                value={reportingYear}
                onChange={(e) => setReportingYear(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
              >
                {MODULE_IMAGE_REPORTING_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Date of Activity <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          {categoryLabel && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground">
              <span>
                Photographs already added for <strong>{categoryLabel}</strong> in {reportingYear}:{" "}
                {uploadedImages.length}
              </span>
              <Link href="/module-images" className="font-medium whitespace-nowrap hover:underline">
                View Uploaded Images
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <UploadCloud className="size-3.5" />
            Upload Image
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">
                Select Image <span className="text-destructive">*</span>
              </Label>
              <label className="mt-1 flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 text-center hover:bg-muted/60">
                {pendingPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pendingPreviewUrl} alt="Selected preview" className="h-full w-full rounded-md object-cover" />
                ) : (
                  <>
                    <UploadCloud className="size-6 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground">Drag & drop image here, or click to choose a file</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Allowed file types: JPG, JPEG, PNG. Max file size: {MAX_IMAGE_SIZE_MB}MB.
              </p>
              {fileError && <p className="mt-1 text-xs text-destructive">{fileError}</p>}
            </div>
            <div className="flex flex-col">
              <Label htmlFor="caption" className="text-xs text-muted-foreground">
                Caption <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter caption for this photograph"
                className="mt-1 flex-1"
              />
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="size-3 shrink-0" />
                Caption is mandatory for each image.
              </p>
            </div>
          </div>

          {formError && <p className="mt-3 text-xs text-destructive">{formError}</p>}

          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={addToList}>
              <ImagePlus className="size-3.5" />
              Add to List
            </Button>
          </div>

          {uploadedImages.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="divide-x divide-border border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    <th className="w-14 px-4 py-2">S.No</th>
                    <th className="w-20 px-4 py-2">Preview</th>
                    <th className="px-4 py-2">Caption</th>
                    <th className="px-4 py-2">Upload Date</th>
                    <th className="w-16 px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedImages.map((img, index) => (
                    <tr key={img.id} className="divide-x divide-border border-b border-border last:border-0">
                      <td className="px-4 py-2 text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.previewUrl} alt={img.caption} className="size-10 rounded-md object-cover" />
                      </td>
                      <td className="px-4 py-2 text-foreground">{img.caption}</td>
                      <td className="px-4 py-2 text-muted-foreground">{img.uploadDate}</td>
                      <td className="px-4 py-2 text-right">
                        <Button variant="ghost" size="icon-sm" onClick={() => removeUploaded(img.id)}>
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/module-images")}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => router.push("/module-images")}>
            Save as Draft
          </Button>
          <Button onClick={handleSubmit}>Save &amp; Submit</Button>
        </div>
      </div>
    </div>
  );
}
