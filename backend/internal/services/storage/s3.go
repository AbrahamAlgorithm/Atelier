package storage

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type S3Service struct {
	client    *s3.Client
	presigner *s3.PresignClient
	bucket    string
	region    string
}

func NewS3(accessKey, secretKey, region, bucket string) (*S3Service, error) {
	cfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithRegion(region),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg)
	svc := &S3Service{
		client:    client,
		presigner: s3.NewPresignClient(client),
		bucket:    bucket,
		region:    region,
	}

	if err := svc.ensureCORS(context.Background()); err != nil {
		log.Printf("warning: could not set bucket CORS: %v", err)
	}

	return svc, nil
}

// ensureCORS sets a permissive CORS policy on the bucket so browsers can PUT
// files directly via presigned URLs from any origin.
func (s *S3Service) ensureCORS(ctx context.Context) error {
	_, err := s.client.PutBucketCors(ctx, &s3.PutBucketCorsInput{
		Bucket: aws.String(s.bucket),
		CORSConfiguration: &types.CORSConfiguration{
			CORSRules: []types.CORSRule{
				{
					AllowedHeaders: []string{"*"},
					AllowedMethods: []string{"PUT", "GET", "HEAD", "POST", "DELETE"},
					AllowedOrigins: []string{"*"},
					ExposeHeaders:  []string{"ETag", "Content-Length"},
					MaxAgeSeconds:  aws.Int32(3600),
				},
			},
		},
	})
	if err != nil {
		return err
	}
	log.Println("S3 bucket CORS configured")
	return nil
}


func (s *S3Service) PresignUpload(ctx context.Context, key, contentType string) (*PresignResult, error) {
	req, err := s.presigner.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return nil, err
	}

	fileURL := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)
	return &PresignResult{
		UploadURL: req.URL,
		FileURL:   fileURL,
		Key:       key,
	}, nil
}

// PresignAttachmentURL generates a short-lived presigned GET URL that tells the
// browser to download the file instead of displaying it (Content-Disposition: attachment).
func (s *S3Service) PresignAttachmentURL(ctx context.Context, key, filename string) (string, error) {
	disposition := fmt.Sprintf("attachment; filename=%q", filename)
	req, err := s.presigner.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket:                     aws.String(s.bucket),
		Key:                        aws.String(key),
		ResponseContentDisposition: aws.String(disposition),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (s *S3Service) PresignDownload(ctx context.Context, key string) (string, error) {
	req, err := s.presigner.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(time.Hour))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (s *S3Service) PutObject(ctx context.Context, key, contentType string, body []byte) (string, error) {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
		Body:        bytes.NewReader(body),
	})
	if err != nil {
		return "", err
	}
	// Bucket objects are private; return a presigned GET URL so any client
	// (browser, Three.js, Gemini fetch) can read the file without auth.
	req, err := s.presigner.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(7*24*time.Hour))
	if err != nil {
		// Fall back to the public URL if presigning fails unexpectedly
		return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key), nil
	}
	return req.URL, nil
}

func (s *S3Service) PublicURL(key string) string {
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)
}

// KeyFromURL extracts the S3 object key from a bucket URL (public or presigned).
func (s *S3Service) KeyFromURL(rawURL string) string {
	prefix := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/", s.bucket, s.region)
	key := strings.TrimPrefix(rawURL, prefix)
	// Strip query parameters present in presigned URLs
	if idx := strings.IndexByte(key, '?'); idx != -1 {
		key = key[:idx]
	}
	return key
}

// freshenURL replaces an S3 URL (public or expired presigned) with a fresh
// presigned GET URL. Returns the original string unchanged if it is not one
// of our S3 URLs or if presigning fails.
func (s *S3Service) freshenURL(ctx context.Context, rawURL string) string {
	if rawURL == "" {
		return ""
	}
	key := s.KeyFromURL(rawURL)
	prefix := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/", s.bucket, s.region)
	if !strings.HasPrefix(rawURL, prefix) {
		return rawURL // not our bucket
	}
	signed, err := s.PresignDownload(ctx, key)
	if err != nil {
		return rawURL
	}
	return signed
}

// FreshenURL replaces an S3 URL (public or expired presigned) with a fresh
// 1-hour presigned GET URL. Call this on every output URL before serving job
// responses so clients always receive accessible links.
func (s *S3Service) FreshenURL(ctx context.Context, rawURL string) string {
	return s.freshenURL(ctx, rawURL)
}
