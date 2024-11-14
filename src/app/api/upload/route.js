import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(req) {
  const { fileName, fileType } = await req.json();

  const params = {
    Bucket: 'dnc-lists',
    Key: fileName, 
    Expires: 5 * 24 * 60 * 60 ,// URL expiration in seconds
    ContentType: 'text/csv', // Set the correct Content-Type
  };
  

 

  try {
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;;
    console.log(uploadUrl)
    console.log(fileUrl)
    return NextResponse.json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error('Error generating signed URL', error);
    return NextResponse.json({ message: 'Error generating signed URL' }, { status: 500 });
  }
}
