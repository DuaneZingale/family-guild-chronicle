import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Mail, Plus, RefreshCw, KeyRound } from "lucide-react";

interface MemberRow {
  id: string;
  user_id: string;
  role: string;
  email: string | null;
  characterName: string | null;
  avatarEmoji: string;
}

interface InviteRow {
  id: string;
  invite_code: string;
  role: string;
  email: string | null;
  expires_at: string;
}

const ROLE_OPTIONS = [
  { value: "parent", label: "Guild Master (Admin)" },
  { value: "co-parent", label: "Co-Leader (Spouse)" },
  { value: "kid", label: "Adventurer (Kid)" },
  { value: "guest", label: "Guest (Read-only)" },
];

const ROLE_COLORS: Record<string, string> = {
  parent: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "co-parent": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  kid: "bg-green-500/20 text-green-300 border-green-500/30",
  guest: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export default function GuildSettings() {
  const { membership, user } = useAuth();
  const { toast } = useToast();
  const familyId = membership?.familyId;
  const isParent = membership?.role === "parent" || membership?.role === "co-parent";

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [newInviteRole, setNewInviteRole] = useState("co-parent");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [creatingCode, setCreatingCode] = useState(false);
  const [guildName, setGuildName] = useState(membership?.familyName ?? "");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (familyId) {
      loadMembers();
      loadInvites();
    }
  }, [familyId]);

  async function loadMembers() {
    if (!familyId) return;
    setLoadingMembers(true);

    const { data: memberships } = await supabase
      .from("memberships")
      .select("id, user_id, role")
      .eq("family_id", familyId);

    if (!memberships) {
      setLoadingMembers(false);
      return;
    }

    const { data: links } = await supabase
      .from("user_character_links")
      .select("user_id, character_id")
      .eq("family_id", familyId);

    const { data: characters } = await supabase
      .from("characters")
      .select("id, name, avatar_emoji")
      .eq("family_id", familyId);

    const charMap = new Map(characters?.map((c) => [c.id, c]) ?? []);
    const linkMap = new Map(links?.map((l) => [l.user_id, l.character_id]) ?? []);

    const rows: MemberRow[] = memberships.map((m) => {
      const charId = linkMap.get(m.user_id);
      const char = charId ? charMap.get(charId) : null;
      return {
        id: m.id,
        user_id: m.user_id,
        role: m.role,
        email: null,
        characterName: char?.name ?? null,
        avatarEmoji: char?.avatar_emoji ?? "🧙",
      };
    });

    setMembers(rows);
    setLoadingMembers(false);
  }

  async function loadInvites() {
    if (!familyId) return;
    const { data } = await supabase
      .from("family_invites")
      .select("id, invite_code, role, expires_at, email")
      .eq("family_id", familyId)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    setInvites(data ?? []);
  }

  async function handleSendEmailInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!familyId || !inviteEmail.trim()) return;
    setSendingInvite(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-invite-email", {
        body: {
          email: inviteEmail.trim(),
          familyId,
          role: newInviteRole,
          familyName: membership?.familyName,
          inviterName: user?.email,
        },
      });

      if (error) throw error;

      toast({
        title: "Invite sent! 📧",
        description: `Sent to ${inviteEmail}. Code: ${data?.inviteCode}`,
      });
      setInviteEmail("");
      loadInvites();
    } catch (err: any) {
      toast({
        title: "Failed to send invite",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSendingInvite(false);
    }
  }

  async function handleCreateCodeOnly() {
    if (!familyId) return;
    setCreatingCode(true);

    const code = generateInviteCode();
    const { error } = await supabase.from("family_invites").insert({
      family_id: familyId,
      invite_code: code,
      role: newInviteRole,
    });

    setCreatingCode(false);
    if (error) {
      toast({ title: "Failed to create invite", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Code created! 📜", description: `Code: ${code}` });
      loadInvites();
    }
  }

  async function handleUpdateRole(membershipId: string, newRole: string) {
    const { error } = await supabase
      .from("memberships")
      .update({ role: newRole })
      .eq("id", membershipId);

    if (error) {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role updated ⚔️" });
      loadMembers();
    }
  }

  async function handleSaveGuildName() {
    if (!familyId || !guildName.trim()) return;
    setSavingName(true);
    const { error } = await supabase
      .from("families")
      .update({ name: guildName.trim() })
      .eq("id", familyId);
    setSavingName(false);

    if (error) {
      toast({ title: "Failed to update name", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Guild name updated! 🏰" });
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard! 📋" });
  }

  if (!familyId) {
    return (
      <PageWrapper title="Guild Settings" subtitle="No guild found">
        <div className="parchment-panel p-8 text-center">
          <p className="text-muted-foreground">You need to join or create a guild first.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Guild Settings" subtitle="Manage your guild members and invites">
      <Tabs defaultValue="invites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invites">📧 Invite</TabsTrigger>
          <TabsTrigger value="members">👥 Members</TabsTrigger>
          <TabsTrigger value="guild">🏰 Guild Info</TabsTrigger>
        </TabsList>

        {/* INVITES TAB (now primary) */}
        <TabsContent value="invites" className="space-y-4">
          {isParent && (
            <>
              {/* Email invite - primary */}
              <div className="parchment-panel p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-fantasy text-lg text-foreground">Invite by Email</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send an invite link directly to someone's email. They'll get a code to join your guild.
                </p>
                <form onSubmit={handleSendEmailInvite} className="space-y-3">
                  <div className="flex gap-3 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-xs">Email address</Label>
                      <Input
                        type="email"
                        placeholder="becky@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="min-w-[160px]">
                      <Label className="text-xs">Role</Label>
                      <Select value={newInviteRole} onValueChange={setNewInviteRole}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={sendingInvite || !inviteEmail.trim()}>
                      <Mail className="h-4 w-4 mr-1" />
                      {sendingInvite ? "Sending…" : "Send Invite"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Code-only option - secondary */}
              <div className="parchment-panel p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-fantasy text-sm text-muted-foreground">Or generate a code only</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  For kids on a shared device, or if you want to share a code manually.
                </p>
                <Button variant="outline" size="sm" onClick={handleCreateCodeOnly} disabled={creatingCode}>
                  <Plus className="h-4 w-4 mr-1" />
                  {creatingCode ? "Creating…" : "Generate Code"}
                </Button>
              </div>
            </>
          )}

          {/* Active invites list */}
          <div className="parchment-panel overflow-hidden">
            <div className="p-3 border-b border-border">
              <h3 className="font-fantasy text-sm text-foreground">Active Invites</h3>
            </div>
            {invites.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No active invites.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Copy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm tracking-wider font-bold">
                        {inv.invite_code}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.email || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ROLE_COLORS[inv.role] ?? ""}>
                          {ROLE_OPTIONS.find((r) => r.value === inv.role)?.label ?? inv.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(inv.invite_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* MEMBERS TAB */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-fantasy text-lg text-foreground">Guild Members</h2>
            <Button variant="outline" size="sm" onClick={loadMembers}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </div>

          <div className="parchment-panel overflow-hidden">
            {loadingMembers ? (
              <div className="p-8 text-center text-muted-foreground">Loading members…</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Character</TableHead>
                    <TableHead>Role</TableHead>
                    {isParent && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{member.avatarEmoji}</span>
                          <div>
                            <div className="font-medium">
                              {member.characterName ?? "No character"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {member.user_id === user?.id ? "You" : member.user_id.slice(0, 8) + "…"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={ROLE_COLORS[member.role] ?? ""}
                        >
                          {ROLE_OPTIONS.find((r) => r.value === member.role)?.label ?? member.role}
                        </Badge>
                      </TableCell>
                      {isParent && (
                        <TableCell className="text-right">
                          {member.user_id !== user?.id ? (
                            <Select
                              value={member.role}
                              onValueChange={(val) => handleUpdateRole(member.id, val)}
                            >
                              <SelectTrigger className="w-[160px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-xs text-muted-foreground">Owner</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* GUILD INFO TAB */}
        <TabsContent value="guild" className="space-y-4">
          <div className="parchment-panel p-6 space-y-4">
            <h3 className="font-fantasy text-lg text-foreground">Guild Info</h3>
            <div>
              <Label htmlFor="guildName">Guild Name</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="guildName"
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                  disabled={!isParent}
                  maxLength={100}
                />
                {isParent && (
                  <Button onClick={handleSaveGuildName} disabled={savingName}>
                    {savingName ? "Saving…" : "Save"}
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Guild ID: <span className="font-mono">{familyId}</span></p>
              <p>Your Role: {ROLE_OPTIONS.find((r) => r.value === membership?.role)?.label ?? membership?.role}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
