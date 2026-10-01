export type JobType = 'ghost_mannequin' | 'pattern_generator' | 'virtual_tryon'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface PatternPiece {
  name: string
  description: string
  svg_url: string
  notes?: string
}

export interface JobOutputFiles {
  result_url?: string
  pattern_pieces?: PatternPiece[]
  pdf_url?: string
}

export interface JobInputFiles {
  dress_url?: string
  person_url?: string
}

export interface JobMetadata {
  garment_description?: string
  pattern_analysis?: GarmentAnalysis
}

export interface GarmentAnalysis {
  garment_type: string
  description: string
  estimated_difficulty: string
  pieces: PatternPieceAnalysis[]
}

export interface PatternPieceAnalysis {
  name: string
  description: string
  width_ratio: number
  height_ratio: number
  seam_allowance_cm: number
  notes: string
  shape_type: string
}

export interface Job {
  id: string
  user_id: string
  type: JobType
  status: JobStatus
  input_files: JobInputFiles
  output_files: JobOutputFiles
  metadata: JobMetadata
  error_msg?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  job_id: string
  name: string
  thumbnail_url?: string
  created_at: string
  job?: Job
}

export interface PresignResult {
  upload_url: string
  file_url: string
  key: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}
