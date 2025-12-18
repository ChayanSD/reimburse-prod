"use client";
import * as React from "react";

interface UploadResult {
  url: string;
  public_id?: string;
  format?: string;
  bytes?: number;
  error?: string;
}

interface UploadInput {
  file: File;
}

function useUpload() {
  const [loading, setLoading] = React.useState(false);

  const upload = React.useCallback(
    async (input: UploadInput): Promise<UploadResult> => {
      setLoading(true);
      try {
        // Determine transformation based on file type
        let transformation: string;
        if (input.file.type === 'application/pdf') {
          transformation = "c_scale,w_1000,f_webp,q_100";
        } else {
          transformation = "c_scale,w_1000,q_100,f_auto";
        }

        // 1. Get signed params from server
        const sigRes = await fetch(`/api/cloudinary-signature?transformation=${encodeURIComponent(transformation)}`);
        const { timestamp, signature, apiKey, cloudName } = await sigRes.json();

        const formData = new FormData();
        formData.append("file", input.file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);

        // Transformation as string
        formData.append("transformation", transformation);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Upload failed: ${text}`);
        }

        const data = await res.json();
        return {
          url: data.secure_url,
          public_id: data.public_id,
          format: data.format,
          bytes: data.bytes,
        };
      } catch (err) {
        console.error("Upload error:", err);
        if (err instanceof Error) {
          return { error: err.message, url: "" };
        }
        return { error: "Upload failed", url: "" };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return [upload, { loading }] as const;
}

export { useUpload };
export default useUpload;
