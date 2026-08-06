'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get('q') || '')) {
      router.push(pathname + '?' + createQueryString('q', debouncedSearch));
    }
  }, [debouncedSearch, pathname, router, createQueryString, searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const finalValue = value === 'all' ? '' : value;
    router.push(`${pathname}?${createQueryString(key, finalValue)}`);
  };

  const clearFilters = () => {
    setSearch('');
    router.push(pathname);
  };

  const handleToggle = (key: string) => {
    const isSet = searchParams.get(key) === 'true';
    router.push(`${pathname}?${createQueryString(key, isSet ? '' : 'true')}`);
  };

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full p-4 bg-card/30 border border-border rounded-xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-9 bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setSearch('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
        <Select
          value={searchParams.get('archived') === 'true' ? 'archived' : searchParams.get('trash') === 'true' ? 'trash' : 'active'}
          onValueChange={(v) => {
            if (v === 'active') {
              router.push(`${pathname}?${createQueryString('archived', '')}&${createQueryString('trash', '')}`);
            } else if (v === 'archived') {
              router.push(`${pathname}?${createQueryString('archived', 'true')}&${createQueryString('trash', '')}`);
            } else if (v === 'trash') {
              router.push(`${pathname}?${createQueryString('archived', '')}&${createQueryString('trash', 'true')}`);
            }
          }}
        >
          <SelectTrigger className="w-[120px] bg-background">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="trash">Trash</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-border mx-1" />

        <Select
          value={searchParams.get('status') || 'all'}
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Todo">Todo</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('priority') || 'all'}
          onValueChange={(v) => handleFilterChange('priority', v)}
        >
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="priority:desc">Highest Priority</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-background">
              <Filter className="h-4 w-4 mr-2" /> More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuCheckboxItem
              checked={searchParams.get('overdue') === 'true'}
              onCheckedChange={() => handleToggle('overdue')}
            >
              Overdue Tasks
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={searchParams.get('archived') === 'true'}
              onCheckedChange={() => handleToggle('archived')}
            >
              Archived / Trash
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          type="date"
          className="w-[140px] bg-background"
          value={searchParams.get('dueDate') || ''}
          onChange={(e) => handleFilterChange('dueDate', e.target.value)}
        />
        
        <Input
          type="text"
          placeholder="Assignee ID"
          className="w-[140px] bg-background"
          value={searchParams.get('assigneeId') || ''}
          onChange={(e) => handleFilterChange('assigneeId', e.target.value)}
        />

        <Select
          value={searchParams.get('category') || 'all'}
          onValueChange={(v) => handleFilterChange('category', v)}
        >
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Administration">Administration</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Cleaning">Cleaning</SelectItem>
            <SelectItem value="General">General</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('sort') || 'created_at:desc'}
          onValueChange={(v) => handleFilterChange('sort', v)}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at:desc">Newest First</SelectItem>
            <SelectItem value="created_at:asc">Oldest First</SelectItem>
            <SelectItem value="updated_at:desc">Recently Updated</SelectItem>
            <SelectItem value="due_date:asc">Due Date (Soonest)</SelectItem>
            <SelectItem value="priority:desc">Highest Priority</SelectItem>
            <SelectItem value="title:asc">Alphabetical (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="px-3 text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
