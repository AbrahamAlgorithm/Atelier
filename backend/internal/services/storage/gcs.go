package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
)

type GCSService struct {
	client  *storage.Client
	bucket  string
	saEmail string
}

func NewGCS(ctx context.Context, bucket, credentialsJSON string) (*GCSService, error) {
	var opts []option.ClientOption
	var saEmail string

	if credentialsJSON != "" {
		var jsonBytes []byte
		// Support file path (e.g. /run/secrets/gcs-credentials) as well as raw JSON
		if strings.HasPrefix(credentialsJSON, "/") {
			b, err := os.ReadFile(credentialsJSON)
			if err != nil {
				return nil, fmt.Errorf("read credentials file %s: %w", credentialsJSON, err)
			}
			jsonBytes = b
		} else {
			jsonBytes = []byte(credentialsJSON)
		}
		// Repair literal newlines inside JSON string values (private_key gets corrupted
		// when stored via shell variables or certain Secret Manager workflows).
		jsonBytes = repairJSONNewlines(jsonBytes)
		opts = append(opts, option.WithCredentialsJSON(jsonBytes))
		var cred struct {
			ClientEmail string `json:"client_email"`
		}
		_ = json.Unmarshal(jsonBytes, &cred)
		saEmail = cred.ClientEmail
	}

	client, err := storage.NewClient(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("gcs client: %w", err)
	}

	svc := &GCSService{client: client, bucket: bucket, saEmail: saEmail}

	if err := svc.ensurePublicRead(ctx); err != nil {
		log.Printf("warning: could not set bucket public read: %v", err)
	}

	return svc, nil
}

// repairJSONNewlines replaces literal newline characters inside JSON string
// values with \n escape sequences. Service account keys can arrive with actual
// newlines in the private_key field when passed through shell variables or
// certain Secret Manager workflows, making the JSON invalid.
func repairJSONNewlines(b []byte) []byte {
	out := make([]byte, 0, len(b))
	inString := false
	for i := 0; i < len(b); i++ {
		c := b[i]
		if c == '\\' && i+1 < len(b) {
			// pass escape sequences through unchanged
			out = append(out, c, b[i+1])
			i++
			continue
		}
		if c == '"' {
			inString = !inString
		}
		if inString && c == '\n' {
			out = append(out, '\\', 'n')
			continue
		}
		out = append(out, c)
	}
	return out
}

func (g *GCSService) ensurePublicRead(ctx context.Context) error {
	bkt := g.client.Bucket(g.bucket)
	policy, err := bkt.IAM().Policy(ctx)
	if err != nil {
		return err
	}
	policy.Add("allUsers", "roles/storage.objectViewer")
	return bkt.IAM().SetPolicy(ctx, policy)
}

func (g *GCSService) PutObject(ctx context.Context, key, contentType string, body []byte) (string, error) {
	wc := g.client.Bucket(g.bucket).Object(key).NewWriter(ctx)
	wc.ContentType = contentType
	wc.CacheControl = "public, max-age=86400"

	if _, err := io.Copy(wc, bytes.NewReader(body)); err != nil {
		wc.Close()
		return "", fmt.Errorf("write object: %w", err)
	}
	if err := wc.Close(); err != nil {
		return "", fmt.Errorf("close object: %w", err)
	}
	return g.PublicURL(key), nil
}

func (g *GCSService) PresignUpload(ctx context.Context, key, contentType string) (*PresignResult, error) {
	opts := &storage.SignedURLOptions{
		Scheme:         storage.SigningSchemeV4,
		GoogleAccessID: g.saEmail,
		Method:         "PUT",
		ContentType:    contentType,
		Expires:        time.Now().Add(15 * time.Minute),
	}

	signedURL, err := g.client.Bucket(g.bucket).SignedURL(key, opts)
	if err != nil {
		return nil, fmt.Errorf("sign upload url: %w", err)
	}

	return &PresignResult{
		UploadURL: signedURL,
		FileURL:   g.PublicURL(key),
		Key:       key,
	}, nil
}

func (g *GCSService) PresignDownload(ctx context.Context, key string) (string, error) {
	return g.PublicURL(key), nil
}

func (g *GCSService) PresignAttachmentURL(ctx context.Context, key, filename string) (string, error) {
	return g.PublicURL(key), nil
}

func (g *GCSService) PublicURL(key string) string {
	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", g.bucket, key)
}

func (g *GCSService) KeyFromURL(rawURL string) string {
	prefix := fmt.Sprintf("https://storage.googleapis.com/%s/", g.bucket)
	key := strings.TrimPrefix(rawURL, prefix)
	if idx := strings.IndexByte(key, '?'); idx != -1 {
		key = key[:idx]
	}
	return key
}

func (g *GCSService) FreshenURL(ctx context.Context, rawURL string) string {
	return rawURL
}
