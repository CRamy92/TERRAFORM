import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const fileName = req.query.file;
  if (!fileName) {
    return res.status(400).json({ error: "Missing file parameter" });
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
  };

  try {
    await s3.deleteObject(params).promise();
    return res.status(200).json({ message: "File deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
}
