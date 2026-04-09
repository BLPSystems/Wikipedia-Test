export interface Upload {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error_msg: string | null;
  article_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  upload_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleSection {
  id: string;
  article_id: string;
  heading: string;
  body: string;
  level: number;
  position: number;
  created_at: string;
}

export interface ArticleWithSections extends Article {
  article_sections: ArticleSection[];
}
