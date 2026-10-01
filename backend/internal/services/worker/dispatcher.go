package worker

import (
	"context"
	"log"
	"time"

	"atelier/backend/internal/db"
	"atelier/backend/internal/models"
	"atelier/backend/internal/services/ai"
	"atelier/backend/internal/services/storage"
)

type Dispatcher struct {
	db        *db.DB
	gemini    *ai.GeminiService
	replicate *ai.ReplicateService
	s3        storage.StorageService
	jobCh     chan *models.Job
}

func NewDispatcher(database *db.DB, geminiSvc *ai.GeminiService, replicateSvc *ai.ReplicateService, s3Svc storage.StorageService) *Dispatcher {
	return &Dispatcher{
		db:        database,
		gemini:    geminiSvc,
		replicate: replicateSvc,
		s3:        s3Svc,
		jobCh:     make(chan *models.Job, 50),
	}
}

func (d *Dispatcher) Enqueue(job *models.Job) {
	d.jobCh <- job
}

func (d *Dispatcher) Start(ctx context.Context, numWorkers int) {
	for i := 0; i < numWorkers; i++ {
		go d.runWorker(ctx)
	}

	// Poll DB for any jobs that were pending before restart
	go d.recoverPendingJobs(ctx)
}

func (d *Dispatcher) runWorker(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case job := <-d.jobCh:
			d.processJob(ctx, job)
		}
	}
}

func (d *Dispatcher) recoverPendingJobs(ctx context.Context) {
	time.Sleep(2 * time.Second)
	jobs, err := d.db.GetPendingJobs(ctx)
	if err != nil {
		log.Printf("recover pending jobs: %v", err)
		return
	}
	for _, job := range jobs {
		d.jobCh <- job
	}
}

func (d *Dispatcher) processJob(ctx context.Context, job *models.Job) {
	claimed, err := d.db.ClaimJob(ctx, job.ID)
	if err != nil || !claimed {
		return
	}

	log.Printf("processing job %s type=%s", job.ID, job.Type)

	var outputFiles *models.JobOutputFiles
	var metadata *models.JobMetadata
	var errMsg *string

	switch job.Type {
	case models.JobTypeGhostMannequin:
		outputFiles, metadata, err = processGhostMannequin(ctx, job, d.gemini, d.s3)
	case models.JobTypePatternGenerator:
		outputFiles, metadata, err = processPatternGenerator(ctx, job, d.gemini, d.s3)
	case models.JobTypeVirtualTryOn:
		outputFiles, metadata, err = processVirtualTryOn(ctx, job, d.gemini, d.replicate, d.s3)
	default:
		e := "unknown job type"
		errMsg = &e
	}

	status := models.JobStatusCompleted
	if err != nil {
		status = models.JobStatusFailed
		e := err.Error()
		errMsg = &e
		log.Printf("job %s failed: %v", job.ID, err)
	}

	if updateErr := d.db.UpdateJobStatus(ctx, job.ID, status, outputFiles, metadata, errMsg); updateErr != nil {
		log.Printf("update job status %s: %v", job.ID, updateErr)
	}
}
