import { useState } from "react";
import { useListUsers, useCreateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Shield, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export default function AdminPresenters() {
  const { data: users, isLoading } = useListUsers();
  const { user: currentUser } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  const handleOpenCreate = () => {
    setUsername("");
    setIsAdmin(false);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: { username, isAdmin } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: "User created" });
        setIsFormOpen(false);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.error || "Failed to create user" });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (id === currentUser?.id) {
      toast({ variant: "destructive", title: "Cannot delete yourself" });
      return;
    }
    if (confirm(`Are you sure you want to remove user "${name}"?`)) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast({ title: "User removed" });
        }
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Presenters & Staff</h1>
          <p className="text-muted-foreground mt-1">Manage POS access</p>
        </div>
        <Button onClick={handleOpenCreate} className="hover-elevate">
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : users?.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.isAdmin ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {user.isAdmin ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                    </div>
                    {user.username}
                    {user.id === currentUser?.id && <Badge variant="outline" className="ml-2">You</Badge>}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Admin</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-0">Presenter</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={user.id === currentUser?.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                      onClick={() => handleDelete(user.id, user.username)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input required value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. jsmith" autoFocus />
              <p className="text-xs text-muted-foreground">Users log in using this username only.</p>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Administrator</Label>
                <p className="text-sm text-muted-foreground">Grant access to dashboard and inventory.</p>
              </div>
              <Switch checked={isAdmin} onCheckedChange={setIsAdmin} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || !username.trim()}>
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
