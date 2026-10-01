package db

import (
	"context"
	"encoding/json"
	"time"

	"atelier/backend/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *DB {
	return &DB{pool: pool}
}

// ── Users ──────────────────────────────────────────────────────────────────

func (d *DB) CreateUser(ctx context.Context, email, passwordHash, name string) (*models.User, error) {
	user := &models.User{}
	err := d.pool.QueryRow(ctx,
		`INSERT INTO users (email, password_hash, name)
		 VALUES ($1, $2, $3)
		 RETURNING id, email, password_hash, name, avatar_url, created_at, updated_at`,
		email, passwordHash, name,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.AvatarURL, &user.CreatedAt, &user.UpdatedAt)
	return user, err
}

func (d *DB) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	user := &models.User{}
	err := d.pool.QueryRow(ctx,
		`SELECT id, email, password_hash, name, avatar_url, created_at, updated_at
		 FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.AvatarURL, &user.CreatedAt, &user.UpdatedAt)
	return user, err
}

func (d *DB) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	user := &models.User{}
	err := d.pool.QueryRow(ctx,
		`SELECT id, email, password_hash, name, avatar_url, created_at, updated_at
		 FROM users WHERE id = $1`,
		id,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.AvatarURL, &user.CreatedAt, &user.UpdatedAt)
	return user, err
}

// ── Refresh Tokens ─────────────────────────────────────────────────────────

func (d *DB) CreateRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	_, err := d.pool.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt,
	)
	return err
}

func (d *DB) GetRefreshToken(ctx context.Context, tokenHash string) (string, time.Time, error) {
	var userID string
	var expiresAt time.Time
	err := d.pool.QueryRow(ctx,
		`SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = $1`,
		tokenHash,
	).Scan(&userID, &expiresAt)
	return userID, expiresAt, err
}

func (d *DB) DeleteRefreshToken(ctx context.Context, tokenHash string) error {
	_, err := d.pool.Exec(ctx, `DELETE FROM refresh_tokens WHERE token_hash = $1`, tokenHash)
	return err
}

func (d *DB) DeleteUserRefreshTokens(ctx context.Context, userID string) error {
	_, err := d.pool.Exec(ctx, `DELETE FROM refresh_tokens WHERE user_id = $1`, userID)
	return err
}

// ── Jobs ───────────────────────────────────────────────────────────────────

func (d *DB) CreateJob(ctx context.Context, userID string, jobType models.JobType, inputFiles models.JobInputFiles) (*models.Job, error) {
	inputJSON, _ := json.Marshal(inputFiles)
	job := &models.Job{}
	var inputRaw, outputRaw, metaRaw []byte

	err := d.pool.QueryRow(ctx,
		`INSERT INTO jobs (user_id, type, input_files)
		 VALUES ($1, $2, $3)
		 RETURNING id, user_id, type, status, input_files, output_files, metadata, error_msg, created_at, updated_at, completed_at`,
		userID, jobType, inputJSON,
	).Scan(
		&job.ID, &job.UserID, &job.Type, &job.Status,
		&inputRaw, &outputRaw, &metaRaw,
		&job.ErrorMsg, &job.CreatedAt, &job.UpdatedAt, &job.CompletedAt,
	)
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(inputRaw, &job.InputFiles)
	_ = json.Unmarshal(outputRaw, &job.OutputFiles)
	_ = json.Unmarshal(metaRaw, &job.Metadata)
	return job, nil
}

func (d *DB) GetJob(ctx context.Context, id, userID string) (*models.Job, error) {
	job := &models.Job{}
	var inputRaw, outputRaw, metaRaw []byte
	err := d.pool.QueryRow(ctx,
		`SELECT id, user_id, type, status, input_files, output_files, metadata, error_msg, created_at, updated_at, completed_at
		 FROM jobs WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(
		&job.ID, &job.UserID, &job.Type, &job.Status,
		&inputRaw, &outputRaw, &metaRaw,
		&job.ErrorMsg, &job.CreatedAt, &job.UpdatedAt, &job.CompletedAt,
	)
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(inputRaw, &job.InputFiles)
	_ = json.Unmarshal(outputRaw, &job.OutputFiles)
	_ = json.Unmarshal(metaRaw, &job.Metadata)
	return job, nil
}

func (d *DB) ListUserJobs(ctx context.Context, userID string) ([]*models.Job, error) {
	rows, err := d.pool.Query(ctx,
		`SELECT id, user_id, type, status, input_files, output_files, metadata, error_msg, created_at, updated_at, completed_at
		 FROM jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []*models.Job
	for rows.Next() {
		job := &models.Job{}
		var inputRaw, outputRaw, metaRaw []byte
		if err := rows.Scan(
			&job.ID, &job.UserID, &job.Type, &job.Status,
			&inputRaw, &outputRaw, &metaRaw,
			&job.ErrorMsg, &job.CreatedAt, &job.UpdatedAt, &job.CompletedAt,
		); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(inputRaw, &job.InputFiles)
		_ = json.Unmarshal(outputRaw, &job.OutputFiles)
		_ = json.Unmarshal(metaRaw, &job.Metadata)
		jobs = append(jobs, job)
	}
	return jobs, nil
}

func (d *DB) UpdateJobStatus(ctx context.Context, id string, status models.JobStatus, outputFiles *models.JobOutputFiles, metadata *models.JobMetadata, errMsg *string) error {
	outputJSON, _ := json.Marshal(outputFiles)
	metaJSON, _ := json.Marshal(metadata)

	var completedAt *time.Time
	if status == models.JobStatusCompleted || status == models.JobStatusFailed {
		t := time.Now()
		completedAt = &t
	}

	_, err := d.pool.Exec(ctx,
		`UPDATE jobs SET status=$1, output_files=$2, metadata=$3, error_msg=$4, updated_at=NOW(), completed_at=$5
		 WHERE id=$6`,
		status, outputJSON, metaJSON, errMsg, completedAt, id,
	)
	return err
}

func (d *DB) DeleteJob(ctx context.Context, id, userID string) error {
	tag, err := d.pool.Exec(ctx, `DELETE FROM jobs WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (d *DB) GetPendingJobs(ctx context.Context) ([]*models.Job, error) {
	rows, err := d.pool.Query(ctx,
		`SELECT id, user_id, type, status, input_files, output_files, metadata, error_msg, created_at, updated_at, completed_at
		 FROM jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 10`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []*models.Job
	for rows.Next() {
		job := &models.Job{}
		var inputRaw, outputRaw, metaRaw []byte
		if err := rows.Scan(
			&job.ID, &job.UserID, &job.Type, &job.Status,
			&inputRaw, &outputRaw, &metaRaw,
			&job.ErrorMsg, &job.CreatedAt, &job.UpdatedAt, &job.CompletedAt,
		); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(inputRaw, &job.InputFiles)
		_ = json.Unmarshal(outputRaw, &job.OutputFiles)
		_ = json.Unmarshal(metaRaw, &job.Metadata)
		jobs = append(jobs, job)
	}
	return jobs, nil
}

func (d *DB) ClaimJob(ctx context.Context, id string) (bool, error) {
	tag, err := d.pool.Exec(ctx,
		`UPDATE jobs SET status='processing', updated_at=NOW() WHERE id=$1 AND status='pending'`,
		id,
	)
	return tag.RowsAffected() == 1, err
}

// ── Password Reset Tokens ─────────────────────────────────────────────────

func (d *DB) CreatePasswordResetToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	// delete any existing tokens for this user first
	_, _ = d.pool.Exec(ctx, `DELETE FROM password_reset_tokens WHERE user_id = $1`, userID)
	_, err := d.pool.Exec(ctx,
		`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt,
	)
	return err
}

// ConsumePasswordResetToken looks up a token, deletes it, and returns the user ID and expiry.
func (d *DB) ConsumePasswordResetToken(ctx context.Context, tokenHash string) (userID string, expiresAt time.Time, err error) {
	err = d.pool.QueryRow(ctx,
		`DELETE FROM password_reset_tokens WHERE token_hash = $1 RETURNING user_id, expires_at`,
		tokenHash,
	).Scan(&userID, &expiresAt)
	return
}

func (d *DB) UpdateUserPassword(ctx context.Context, userID, passwordHash string) error {
	_, err := d.pool.Exec(ctx,
		`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
		passwordHash, userID,
	)
	return err
}

// ── Projects ───────────────────────────────────────────────────────────────

func (d *DB) CreateProject(ctx context.Context, userID, jobID, name string, thumbnailURL *string) (*models.Project, error) {
	p := &models.Project{}
	err := d.pool.QueryRow(ctx,
		`INSERT INTO projects (user_id, job_id, name, thumbnail_url)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, user_id, job_id, name, thumbnail_url, created_at`,
		userID, jobID, name, thumbnailURL,
	).Scan(&p.ID, &p.UserID, &p.JobID, &p.Name, &p.ThumbnailURL, &p.CreatedAt)
	return p, err
}

func (d *DB) ListProjects(ctx context.Context, userID string) ([]*models.Project, error) {
	rows, err := d.pool.Query(ctx,
		`SELECT p.id, p.user_id, p.job_id, p.name, p.thumbnail_url, p.created_at
		 FROM projects p WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []*models.Project
	for rows.Next() {
		p := &models.Project{}
		if err := rows.Scan(&p.ID, &p.UserID, &p.JobID, &p.Name, &p.ThumbnailURL, &p.CreatedAt); err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}
	return projects, nil
}

func (d *DB) GetProject(ctx context.Context, id, userID string) (*models.Project, error) {
	p := &models.Project{}
	err := d.pool.QueryRow(ctx,
		`SELECT id, user_id, job_id, name, thumbnail_url, created_at
		 FROM projects WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(&p.ID, &p.UserID, &p.JobID, &p.Name, &p.ThumbnailURL, &p.CreatedAt)
	return p, err
}

func (d *DB) DeleteProject(ctx context.Context, id, userID string) error {
	_, err := d.pool.Exec(ctx, `DELETE FROM projects WHERE id = $1 AND user_id = $2`, id, userID)
	return err
}
