import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Error parsing form data" });
    }

    const file = files.file;
    const fileStream = fs.createReadStream(file.filepath);

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: path.basename(file.originalFilename),
      Body: fileStream,
      ContentType: file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(uploadParams));
      return res.status(200).json({ message: "Upload successful" });
    } catch (err) {
      console.error("S3 upload error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
