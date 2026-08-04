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
      <Input
        placeholder="Search staff by name or job title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center p-12 space-y-3">
              <span className="text-4xl text-muted-foreground">👨‍💼</span>
              <h3 className="text-lg font-semibold text-foreground">No staff members found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No team members match your search criteria. Add staff members to manage rosters and commissions.
              </p>
              <Button onClick={() => setIsSheetOpen(true)} size="sm">
                + Add Staff Member
              </Button>
            </div>
          ) : (
            <div className="rounded-md border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((staff) => (
                    <TableRow key={staff.id} className="hover:bg-muted/50">
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
                        <div className="text-sm text-muted-foreground uppercase">{staff.systemRole}</div>
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
