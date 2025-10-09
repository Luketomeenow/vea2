import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, Upload, Search, Download, Eye, Trash2, FolderOpen, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  category: 'contract' | 'invoice' | 'proposal' | 'report' | 'presentation' | 'other';
  size: string;
  uploadDate: string;
  lastModified: string;
  uploadedBy: string;
  tags: string[];
  status: 'draft' | 'review' | 'approved' | 'archived';
}

const sampleDocuments: DocumentItem[] = [
  { id: '1', name: 'Q4 2024 Business Report.pdf', type: 'PDF', category: 'report', size: '2.4 MB', uploadDate: '2024-01-10', lastModified: '2024-01-15', uploadedBy: 'Sarah Chen', tags: ['quarterly', 'finance', 'analysis'], status: 'approved' },
  { id: '2', name: 'Client Proposal - ABC Corp.docx', type: 'DOCX', category: 'proposal', size: '1.8 MB', uploadDate: '2024-01-12', lastModified: '2024-01-14', uploadedBy: 'John Smith', tags: ['proposal', 'abc-corp', 'sales'], status: 'review' },
];

const Documents = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(sampleDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contract': return '📋';
      case 'invoice': return '🧾';
      case 'proposal': return '📊';
      case 'report': return '📈';
      case 'presentation': return '📽️';
      default: return '📄';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return '📕';
      case 'docx':
      case 'doc': return '📘';
      case 'pptx':
      case 'ppt': return '📙';
      case 'xlsx':
      case 'xls': return '📗';
      default: return '📄';
    }
  };

  const documentsByCategory = {
    contracts: documents.filter(d => d.category === 'contract'),
    invoices: documents.filter(d => d.category === 'invoice'),
    proposals: documents.filter(d => d.category === 'proposal'),
    reports: documents.filter(d => d.category === 'report'),
    presentations: documents.filter(d => d.category === 'presentation'),
    other: documents.filter(d => d.category === 'other')
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Documents</h1>
              <p className="text-white/70">Manage and organize your business documents</p>
            </div>
          </div>
          
          <Button className="bg-gradient-primary text-white hover:opacity-90">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Total Documents</p>
                  <p className="text-2xl font-bold text-white">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Eye className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Under Review</p>
                  <p className="text-2xl font-bold text-white">{documents.filter(d => d.status === 'review').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Approved</p>
                  <p className="text-2xl font-bold text-white">{documents.filter(d => d.status === 'approved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <File className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Storage Used</p>
                  <p className="text-2xl font-bold text-white">12.4 GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documents, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="presentations">Presentations</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">All Documents ({filteredDocuments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="text-2xl">{getFileIcon(doc.type)}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">{doc.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getCategoryIcon(doc.category)}</span>
                            <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{doc.type} • {doc.size}</span>
                          <span>Uploaded by {doc.uploadedBy}</span>
                          <span>Modified {new Date(doc.lastModified).toLocaleDateString()}</span>
                        </div>
                        
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {Object.entries(documentsByCategory).map(([category, docs]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize text-white">{category} ({docs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {docs.map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="text-2xl">{getFileIcon(doc.type)}</div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium truncate">{doc.name}</h3>
                            <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{doc.type} • {doc.size}</span>
                            <span>Uploaded by {doc.uploadedBy}</span>
                            <span>Modified {new Date(doc.lastModified).toLocaleDateString()}</span>
                          </div>
                          
                          {doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {docs.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No {category} documents found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Documents;




