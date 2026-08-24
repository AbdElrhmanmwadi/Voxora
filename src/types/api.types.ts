export interface UploadResponse {
  signal: string;
  file_id: string;
}

export interface ProjectFile {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type?: string;
  file_path?: string;
  // Number of indexed chunks; `processed` is true once chunk_count > 0.
  chunk_count?: number;
  processed?: boolean;
  file_created_at?: string;
  file_updated_at?: string;
}

export interface FileListResponse {
  signal: string;
  files: ProjectFile[];
}

export interface ProcessResponse {
  signal: string;
  inserted_chunks: number;
  processed_files: number;
}

export interface IndexPushResponse {
  signal: string;
}

export interface SearchResultItem {
  text: string;
  score: number;
  meta_data: Record<string, unknown>;
}

export interface SearchResponse {
  signal: string;
  search_result: SearchResultItem[];
}

export interface RagAnswerResponse {
  signal: string;
  answer: string;
  full_prompt?: string;
  chat_history?: unknown[];
}

export interface FeedbackCreateResponse {
  signal: string;
  feedback_id: number;
}

export interface FeedbackAnalyticsResponse {
  signal: string;
  total: number;
  positive: number;
  negative: number;
  csat: number | null;
  top_disliked_questions: { question: string; count: number }[];
}

export interface TranslationJobCreateResponse {
  signal: string;
  job_id: string | number;
  status: string;
  asset_id: string;
  source_lang: string;
  target_lang: string;
}

export interface TranslationJobStatusResponse {
  signal: string;
  job: {
    job_id: string | number;
    status: string;
    progress?: number;
    asset_id?: string;
    source_lang?: string;
    target_lang?: string;
    created_at?: string;
    updated_at?: string;
    result_file_id?: string;
    error_message?: string;
  };
}

// `signal` values the voice endpoints can return, including the validation
// failures the hardened backend now emits before processing.
export type VoiceSignal =
  | 'stt_success'
  | 'stt_failed'
  | 'stt_timeout'
  | 'tts_failed'
  | 'voice_chat_success'
  | 'voice_chat_failed'
  | 'voice_chat_timeout'
  | 'rag_answer_failed'
  | 'file_type_not_supported'
  | 'file_size_exceeded'

export interface SttResponse {
  signal: VoiceSignal;
  text?: string;
  language?: string;
  duration_ms?: number;
  message?: string;
}

export interface VoiceChatResponse {
  // full_prompt / chat_history were removed by the backend (they leaked the
  // internal prompt and raw retrieved context) — do not read them.
  signal: VoiceSignal;
  transcript?: string;
  answer?: string;
  audio_base64?: string;
  audio_mime_type?: string;
  message?: string;
}
