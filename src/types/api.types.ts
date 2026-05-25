export interface UploadResponse {
  signal: string;
  file_id: string;
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

export interface TranslationJobCreateResponse {
  signal: string;
  job_id: string;
  status: string;
  asset_id: string;
  source_lang: string;
  target_lang: string;
}

export interface TranslationJobStatusResponse {
  signal: string;
  job: {
    job_id: string;
    status: string;
    result_file_id?: string;
    error_message?: string;
  };
}

export interface SttResponse {
  signal: 'stt_success' | 'stt_failed' | 'stt_timeout';
  text?: string;
  language?: string;
  duration_ms?: number;
  message?: string;
}

export interface VoiceChatResponse {
  signal: 'voice_chat_success' | 'voice_chat_failed' | 'voice_chat_timeout' | 'rag_answer_failed' | 'stt_failed';
  transcript?: string;
  answer?: string;
  audio_base64?: string;
  audio_mime_type?: string;
  full_prompt?: string;
  chat_history?: unknown[];
  message?: string;
}
