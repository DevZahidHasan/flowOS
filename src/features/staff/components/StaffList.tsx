'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StaffMember } from '../types';
import { CreateStaffSheet } from './CreateStaffSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { deleteStaffAction } from '../actions/staff.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

interface Props {
  workspaceId: string;
  initialStaff: StaffMember[];
}

export function StaffList({ workspaceId, initialStaff }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filtered = initialStaff.filter((s) => {
    const matchesSearch =
      s.displayName.toLowerCase().includes(search.toLowerCase()) ||
      s.roleTitle.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterActive === 'ACTIVE') return s.isActive;
    if (filterActive === 'INACTIVE') return !s.isActive;

    return true;
  });

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to permanently delete this staff member?')) return;
    setIsDeleting(staffId);
    const res = await deleteStaffAction(workspaceId, staffId);
    setIsDeleting(null);

    if (res.error) {
      toast({
        title: 'Delete failed',
        description: res.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Staff member deleted',
        description: 'The staff member has been removed successfully.',
      });
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={filterActive === 'ALL' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilterActive('ALL')}
            className="whitespace-nowrap"
          >
            All Staff ({initialStaff.length})
          </Button>
          <Button
            variant={filterActive === 'ACTIVE' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilterActive('ACTIVE')}
            className="whitespace-nowrap"
          >
            Active Roster
          </Button>
          <Button
            variant={filterActive === 'INACTIVE' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilterActive('INACTIVE')}
            className="whitespace-nowrap"
          >
            Inactive / On Leave
          </Button>
        </div>

        <Button onClick={() => setIsSheetOpen(true)}>
          + Add Staff Member
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Search staff by name or job title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 w-full"
          aria-label="Search staff members"
        />
      </div>

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No staff members"
                description="Invite or create staff members to begin assigning appointments and services."
                action={
                  <Button onClick={() => setIsSheetOpen(true)} className="w-full sm:w-auto min-h-[44px]">
                    + Add Staff
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="rounded-md border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Staff Member</TableHead>
                    <TableHead scope="col">Role</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">System Role</TableHead>
                    <TableHead scope="col" className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((staff, index) => (
                    <TableRow key={staff.id} className="hover:bg-muted/50 transition-colors duration-150" style={{ animationDelay: `${index * 30}ms` }}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
                            {staff.displayName.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div>{staff.displayName}</div>
                            <div className="text-xs text-muted-foreground">ID: {staff.id.substring(0,8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{staff.roleTitle}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={staff.isActive ? "default" : "secondary"} className="text-[10px]">
                          {staff.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground uppercase">{staff.userId ? 'LINKED' : 'STANDARD'}</div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(staff.id)}
                          disabled={isDeleting === staff.id}
                        >
                          {isDeleting === staff.id ? 'Deleting…' : 'Delete'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Staff Bottom Sheet Modal */}
      <CreateStaffSheet
        workspaceId={workspaceId}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
