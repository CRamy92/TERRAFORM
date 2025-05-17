import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const data = await s3.send(
      new ListObjectsV2Command({ Bucket: process.env.AWS_S3_BUCKET_NAME })
    );

    const files = data.Contents ? data.Contents.map((obj) => obj.Key) : [];
    return res.status(200).json({ files });
  } catch (err) {
    console.error("S3 list error:", err);
    return res.status(500).json({ error: "Failed to list files" });
  }
}
