// import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid"; //for file upload/storing
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"; // aws sdk v3 style

// export const s3Uploadv2 = async (files) => {
//   const s3 = new S3();

//   const params = files.map((file) => {
//     return {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: `uploads/${uuidv4}-${file.originalname}`,
//       Body: file.buffer,
//     };
//   });
//   return await Promise.all(
//     params.map((param) => {
//       s3.upload(param).promise();
//     })
//   );
// };

export const s3Uploadv3 = async (files) => {
  const s3client = new S3Client();

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uuidv4}-${file.originalname}`,
      Body: file.buffer,
    };
  });
  return await Promise.all(
    params.map((param) => {
      return s3client.send(new PutObjectCommand(param));
    })
  );
};
