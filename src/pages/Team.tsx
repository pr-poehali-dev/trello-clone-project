import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "@/lib/api";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

const roleColors: Record<string, string> = {
  admin: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  member: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  team_role: string;
  created_at: string;
  joined_at?: string;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-700",
  "from-pink-500 to-rose-700",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-red-700",
];

export default function Team() {
  const qc = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [search, setSearch] = useState("");

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["team"],
    queryFn: teamApi.getMembers,
  });

  const inviteMutation = useMutation({
    mutationFn: teamApi.invite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      setInviteOpen(false);
      setForm({ name: "", email: "" });
    },
  });

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gradient-purple">Команда</h1>
            <p className="text-muted-foreground mt-1">{members.length} участников</p>
          </div>
          <Button
            onClick={() => setInviteOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 shadow-lg"
          >
            <Icon name="UserPlus" size={16} className="mr-2" />
            Пригласить
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6 animate-slide-in-left">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-in-right">
          {[
            { label: "Всего участников", value: members.length, icon: "Users", color: "text-violet-400" },
            { label: "Администраторов", value: members.filter((m) => m.role === "admin").length, icon: "Shield", color: "text-cyan-400" },
            { label: "Участников", value: members.filter((m) => m.role === "member").length, icon: "User", color: "text-pink-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={stat.icon as never} size={16} className={stat.color} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Members list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl glass animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((member, i) => (
              <div
                key={member.id}
                className="glass border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all duration-200 animate-fade-in glass-hover"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback
                    className={`bg-gradient-to-br ${AVATAR_GRADIENTS[member.id % AVATAR_GRADIENTS.length]} text-white text-sm font-bold`}
                  >
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{member.name}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 border ${roleColors[member.role] || roleColors.member}`}
                    >
                      {member.role === "admin" ? "Админ" : "Участник"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {member.joined_at
                      ? `Вступил ${new Date(member.joined_at).toLocaleDateString("ru")}`
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground animate-fade-in">
                <Icon name="UserX" size={32} className="mx-auto mb-2 opacity-40" />
                <p>Участники не найдены</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="text-gradient-purple flex items-center gap-2">
              <Icon name="UserPlus" size={16} />
              Пригласить участника
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Имя участника"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-secondary border-border"
            />
            <Input
              type="email"
              placeholder="Email адрес"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-secondary border-border"
            />
            <Button
              onClick={() => inviteMutation.mutate(form)}
              disabled={!form.name || !form.email || inviteMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0"
            >
              {inviteMutation.isPending ? "Отправка..." : "Отправить приглашение"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
