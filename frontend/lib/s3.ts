import { presignUpload, uploadToS3 } from './api'

export async function uploadFile(file: File): Promise<string> {
  const { upload_url, file_url } = await presignUpload(file.name, file.type)
  await uploadToS3(upload_url, file)
  return file_url
}
