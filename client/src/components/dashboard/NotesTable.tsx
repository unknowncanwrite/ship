import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, ArrowUpDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Note {
  id: string;
  name: string;
  notes: string;
}

interface NotesTableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotesTable({ open, onOpenChange }: NotesTableProps) {
  const [notesList, setNotesList] = useState<Note[]>([
    { id: '1', name: 'Project A', notes: 'Sample note' }
  ]);
  const [newName, setNewName] = useState('');
  const [newNote, setNewNote] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const addNote = () => {
    if (newName.trim() && newNote.trim()) {
      setNotesList([
        ...notesList,
        {
          id: Date.now().toString(),
          name: newName,
          notes: newNote
        }
      ]);
      setNewName('');
      setNewNote('');
    }
  };

  const updateNote = (id: string, field: 'name' | 'notes', value: string) => {
    setNotesList(notesList.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const deleteNote = (id: string) => {
    setNotesList(notesList.filter(n => n.id !== id));
  };

  const sortedNotes = [...notesList].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return sortAsc ? comparison : -comparison;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[40vw] max-w-2xl flex flex-col p-0">
        <SheetHeader className="border-b px-6 py-4 sticky top-0 bg-background">
          <div className="flex items-center justify-between w-full">
            <SheetTitle>Notes</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setSortAsc(!sortAsc)}
              title="Sort by name"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20 sticky top-0">
                  <th className="text-left px-6 py-2 text-xs font-semibold text-muted-foreground">Name</th>
                  <th className="text-left px-6 py-2 text-xs font-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sortedNotes.map((note) => (
                  <tr key={note.id} className="border-b hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-2 text-xs">
                      <input
                        type="text"
                        value={note.name}
                        onChange={(e) => updateNote(note.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 font-medium text-foreground placeholder-muted-foreground"
                        placeholder="Name..."
                      />
                    </td>
                    <td className="px-6 py-2 text-xs flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={note.notes}
                        onChange={(e) => updateNote(note.id, 'notes', e.target.value)}
                        className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground placeholder-muted-foreground"
                        placeholder="Notes..."
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Note */}
        <div className="bg-muted/5 px-6 py-4 border-t space-y-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Note name..."
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNote()}
              placeholder="Add note..."
              className="h-8 text-xs flex-1"
            />
            <Button
              onClick={addNote}
              className="bg-accent hover:bg-accent/90 text-white h-8 px-2"
              size="sm"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
