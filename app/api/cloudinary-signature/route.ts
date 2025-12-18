import crypto from "crypto";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const url = new URL(request.url);
    const transformation = url.searchParams.get('transformation') || "c_scale,w_1000/f_jpg";

    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

    if (!apiSecret || !apiKey || !cloudName) {
      return NextResponse.json(
        { error: "Cloudinary configuration missing" },
        { status: 500 }
      );
    }

    const stringToSign = `timestamp=${timestamp}&transformation=${transformation}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    return NextResponse.json({
      timestamp,
      signature,
      apiKey,
      cloudName,
      transformation,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Cloudinary signature error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
