import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Edit, Trash2 } from 'lucide-react';

export function GeneratedPapersWireframe() {
  const navigate = useNavigate();
  const { isInitialized, papers, deletePaper } = useMockStore();

  const handleEdit = (paperId: string) => {
    // Only navigate if store is initialized
    if (!isInitialized) return;
    navigate({ to: `/editor/${paperId}` });
  };

  const handleExport = (paperId: string) => {
    navigate({ to: `/export/${paperId}` });
  };

  const handleDelete = (paperId: string) => {
    if (confirm('Are you sure you want to delete this paper?')) {
      deletePaper(paperId);
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generated Papers</h1>
          <p className="mt-2 text-muted-foreground">View and manage your exam papers</p>
        </div>
        <Button onClick={() => navigate({ to: '/home' })}>Back to Home</Button>
      </div>

      {papers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">No papers yet</h3>
            <p className="mb-6 text-center text-muted-foreground">
              Create your first exam paper to get started
            </p>
            <Button onClick={() => navigate({ to: '/home' })}>Create New Paper</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Papers</CardTitle>
            <CardDescription>Click on a paper to edit or export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Board</TableHead>
                    <TableHead className="hidden sm:table-cell">Standard</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {papers.map((paper) => (
                    <TableRow key={paper.id}>
                      <TableCell className="font-medium">{paper.title || 'Untitled Paper'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{paper.board}</TableCell>
                      <TableCell className="hidden sm:table-cell">{paper.standard || '-'}</TableCell>
                      <TableCell>{paper.totalMarks}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(paper.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(paper.id)}
                            title="Edit"
                            disabled={!isInitialized}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExport(paper.id)}
                            title="Export"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(paper.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
