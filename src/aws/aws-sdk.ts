import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// AWS Client setup
const S3_BUCKET = 'kanban-aws';
const REGION = 'ap-south-1';

const AWS_CLIENT = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

// Function to convert File to Uint8Array
async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result)); // Convert ArrayBuffer to Uint8Array
      } else {
        reject(new Error('Failed to convert file to buffer'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

// Function to upload file to S3
export const uploadFile = async (file: File): Promise<string | null> => {
  try {
    console.log('Starting file upload:', { fileName: file.name, fileType: file.type });

    // Convert file to Uint8Array
    const fileBuffer = await fileToUint8Array(file);

    // Generate a unique file name to prevent overwriting
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;

    const params = {
      Bucket: S3_BUCKET,
      Key: `public/${uniqueFileName}`,
      Body: fileBuffer, // Use Uint8Array instead of ArrayBuffer
      ContentType: file.type,
    };

    // console.log('Sending to S3:', { bucket: S3_BUCKET, key: params.Key });

    // Upload the file to S3
    await AWS_CLIENT.send(new PutObjectCommand(params));

    const fileUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/public/${uniqueFileName}`;
    console.log('Upload successful:', { fileUrl });
    return fileUrl;
  } catch (error) {
    console.error('AWS S3 upload error:', error);
    return null;
  }
};

// Function to remove file from S3
export const removeFile = async (
  fileUrl: string,
  setFilePreviews: React.Dispatch<React.SetStateAction<(string | File)[]>>
) => {
  try {
    console.log('Starting file removal:', { fileUrl });

    const urlParts = fileUrl.split(`${S3_BUCKET}.s3.${REGION}.amazonaws.com/`);
    if (urlParts.length !== 2) {
      throw new Error('Invalid S3 URL format');
    }

    const filePath = urlParts[1];
    const params = {
      Bucket: S3_BUCKET,
      Key: filePath,
    };

    console.log('Sending delete command:', { bucket: S3_BUCKET, key: params.Key });

    // Remove the file from S3
    await AWS_CLIENT.send(new DeleteObjectCommand(params));

    setFilePreviews((prev) => prev.filter((url) => url !== fileUrl));
    console.log('File removed successfully');
  } catch (error) {
    console.error('AWS S3 delete error:', error);
  }
};

export default AWS_CLIENT;
