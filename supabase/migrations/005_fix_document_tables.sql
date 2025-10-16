-- Fix document tables type mismatch
-- Drop existing document tables if they have wrong types

DROP TABLE IF EXISTS document_shares CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

-- Recreate documents table with correct UUID type
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  folder_path TEXT DEFAULT '/',
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document versions (for version control)
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  change_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

-- Document shares (for sharing documents)
CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
  shared_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, shared_with_user_id)
);

-- Recreate indexes
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_shares_document_id ON document_shares(document_id);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for documents
CREATE POLICY "Users can view organization documents"
  ON documents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ) OR
    id IN (
      SELECT document_id FROM document_shares WHERE shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ) AND
    uploaded_by = auth.uid()
  );

CREATE POLICY "Document owners can update documents"
  ON documents FOR UPDATE
  USING (uploaded_by = auth.uid());

CREATE POLICY "Document owners can delete documents"
  ON documents FOR DELETE
  USING (uploaded_by = auth.uid());

-- Document versions policies
CREATE POLICY "Users can view document versions"
  ON document_versions FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Document shares policies
CREATE POLICY "Users can view document shares"
  ON document_shares FOR SELECT
  USING (
    shared_with_user_id = auth.uid() OR
    document_id IN (
      SELECT id FROM documents WHERE uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Document owners can manage shares"
  ON document_shares FOR ALL
  USING (
    document_id IN (
      SELECT id FROM documents WHERE uploaded_by = auth.uid()
    )
  );



