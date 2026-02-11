import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function ProfileWireframe() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useMockStore();
  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    updateProfile(formData);
    navigate({ to: '/home' });
  };

  const handleCancel = () => {
    navigate({ to: '/home' });
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Profile</CardTitle>
          <CardDescription>
            Set your default information. These values will be used when creating new papers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Profile defaults are applied automatically to new papers but can be edited per paper.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacherName">Teacher Name *</Label>
              <Input
                id="teacherName"
                placeholder="Enter your name"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instituteName">Institute Name *</Label>
              <Input
                id="instituteName"
                placeholder="Enter institute name"
                value={formData.instituteName}
                onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="board">Preferred Board *</Label>
                <Select
                  value={formData.preferredBoard}
                  onValueChange={(value: 'CBSE' | 'GSEB' | 'Both') =>
                    setFormData({ ...formData, preferredBoard: value })
                  }
                >
                  <SelectTrigger id="board">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="GSEB">GSEB</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medium">Medium *</Label>
                <Select
                  value={formData.medium}
                  onValueChange={(value: 'English' | 'Gujarati') =>
                    setFormData({ ...formData, medium: value })
                  }
                >
                  <SelectTrigger id="medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Gujarati">Gujarati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultStandard">Default Standard (Optional)</Label>
              <Input
                id="defaultStandard"
                placeholder="e.g., 10"
                value={formData.defaultStandard || ''}
                onChange={(e) => setFormData({ ...formData, defaultStandard: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if you teach multiple standards
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolLogo">School Logo (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input id="schoolLogo" type="file" accept="image/*" disabled />
                <span className="text-xs text-muted-foreground">[Placeholder]</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
