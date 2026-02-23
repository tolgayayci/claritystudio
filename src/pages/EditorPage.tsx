import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FileCode2,
  PlayCircle,
  Wand2,
  Clock,
  Calendar,
  Pencil,
  Check,
  X,
  Bug,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Editor } from "@/components/Editor";
import { useToast } from "@/hooks/use-toast";
import { Project, ValidationResult } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { validateContract } from "@/lib/api";
import { useAuth } from "@/App";
import { UserNav } from "@/components/UserNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ABIView } from "@/components/views/ABIView";
import { DeployDialog } from "@/components/editor/DeployDialog";
import { AIChat } from "@/components/ai/AIChat";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/seo/SEO";

const VIEWS = [
  { id: "editor", title: "Editor", icon: FileCode2 },
  { id: "abi", title: "Contract Interface", icon: PlayCircle },
  { id: "ai", title: "AI Assistant", icon: Bot },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

const CLARITY_DEFAULT_CODE = `;; Counter Contract
(define-data-var counter uint u0)

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))

(define-public (decrement)
  (begin
    (var-set counter (- (var-get counter) u1))
    (ok (var-get counter))))

(define-read-only (get-counter)
  (ok (var-get counter)))`;

export function EditorPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);
  const [activeViews, setActiveViews] = useState<ViewId[]>(["editor", "abi", "ai"]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [refreshABITrigger, setRefreshABITrigger] = useState(0);
  const [contractName, setContractName] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch project on mount
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        const { data: project, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!project) throw new Error("Project not found");

        setProject(project);
        setCode(project.code || CLARITY_DEFAULT_CODE);
        setEditedName(project.name);
        setContractName(project.name.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({ title: "Error", description: "Failed to load project", variant: "destructive" });
        navigate("/projects");
      }
    };
    fetchProject();
  }, [id, navigate, toast]);

  // Subscribe to project changes
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel("project_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${id}` },
        (payload) => setProject((prev) => (prev ? { ...prev, ...payload.new } : null))
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Auto-save code changes (debounced 2s)
  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        if (!id || !user) return;
        try {
          const { error } = await supabase
            .from("projects")
            .update({ code: value, updated_at: new Date().toISOString() })
            .eq("id", id);
          if (error) throw error;
          setLastSaved(new Date());
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }, 2000);
    },
    [id, user]
  );

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const toggleView = (viewId: ViewId) => {
    setActiveViews((prev) => {
      const isActive = prev.includes(viewId);
      if (isActive) {
        const newViews = prev.filter((v) => v !== viewId);
        return newViews.length > 0 ? newViews : [viewId];
      } else {
        return [...prev, viewId];
      }
    });
  };

  const handleStartEditing = () => {
    if (project) { setEditedName(project.name); setIsEditingName(true); }
  };

  const handleSaveName = async () => {
    if (!project || !editedName.trim() || editedName === project.name) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({ name: editedName.trim(), updated_at: new Date().toISOString() })
        .eq("id", project.id);
      if (error) throw error;
      setProject((prev) => prev ? { ...prev, name: editedName.trim() } : null);
      setContractName(editedName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"));
      toast({ title: "Success", description: "Project name updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update project name", variant: "destructive" });
      setEditedName(project.name);
    } finally {
      setIsSavingName(false);
      setIsEditingName(false);
    }
  };

  const handleCancelEditing = () => {
    if (project) { setEditedName(project.name); setIsEditingName(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveName();
    else if (e.key === "Escape") handleCancelEditing();
  };

  const handleCheck = async () => {
    if (!project || isChecking || !user) return;
    setIsChecking(true);
    try {
      const result = await validateContract(code, contractName);
      setLastValidation(result);
      toast({
        title: result.success ? "Validation Passed" : "Validation Failed",
        description: result.success ? "Your Clarity code is valid" : `Found ${result.errors.length} error(s)`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to validate contract",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestDeploy = () => {
    setShowDeployDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "numeric", hour12: true,
    }).format(new Date(dateString));
  };

  const handleReportIssue = () => {
    window.open("https://github.com/claritystudio/claritystudio/issues/new?labels=bug&template=bug_report.md", "_blank");
  };

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Loading project...</span>
        </div>
      </div>
    );
  }

  const hasEditor = activeViews.includes("editor");
  const hasABI = activeViews.includes("abi");
  const hasAI = activeViews.includes("ai");

  const getMainPanelWidth = () => {
    const activeMainViews = [hasEditor, hasABI, hasAI].filter(Boolean).length;
    if (activeMainViews === 0) return "100%";
    return `${100 / activeMainViews}%`;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <SEO
        title={project?.name || "Editor"}
        description={project?.description || "Clarity smart contract development environment"}
        type="app"
      />

      {/* Header */}
      <header className="h-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full flex flex-col justify-center px-4">
          <div className="flex items-center">
            {/* Left — Project info */}
            <div className="flex-1 flex items-center gap-4">
              <Link to="/projects" className="flex items-center gap-2 hover:text-primary transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wand2 className="h-5 w-5 text-primary" />
                </div>
              </Link>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        ref={nameInputRef}
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-8 text-xl font-semibold bg-background"
                        disabled={isSavingName}
                      />
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveName} disabled={isSavingName}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEditing} disabled={isSavingName}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-semibold">{project.name}</h1>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleStartEditing}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Badge variant="outline" className="px-1 h-4 text-[10px] bg-primary/10 text-primary hover:bg-primary/20">
                        BETA
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-7 gap-1.5" onClick={handleReportIssue}>
                        <Bug className="h-3.5 w-3.5" />
                        <span className="text-xs">Report Issue</span>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created {formatDate(project.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {lastSaved ? `Saved ${formatDate(lastSaved.toISOString())}` : `Updated ${formatDate(project.updated_at)}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center — View tabs */}
            <div className="flex items-center">
              <div className="flex items-center gap-px bg-muted rounded-md border overflow-hidden">
                {VIEWS.map((view) => (
                  <Button
                    key={view.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-3 gap-2 rounded-none transition-all relative",
                      activeViews.includes(view.id)
                        ? ["bg-background text-foreground font-medium",
                           "before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-primary"]
                        : ["text-muted-foreground hover:text-foreground hover:bg-muted/80",
                           "hover:before:absolute hover:before:inset-x-0 hover:before:bottom-0 hover:before:h-0.5 hover:before:bg-muted-foreground/30"]
                    )}
                    onClick={() => toggleView(view.id)}
                  >
                    <view.icon className={cn(
                      "h-4 w-4 transition-colors",
                      activeViews.includes(view.id) ? "text-foreground" : "text-muted-foreground"
                    )} />
                    <span className="text-xs">{view.title}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Right — Actions */}
            <div className="flex-1 flex items-center justify-end gap-2">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Panels — Editor + ABI side by side */}
        <div className="flex h-full">
          {hasEditor && (
            <div style={{ width: getMainPanelWidth() }} className="h-full overflow-hidden p-2">
              <Editor
                value={code}
                onChange={handleCodeChange}
                onCompile={handleCheck}
                isCompiling={isChecking}
                projectId={project.id}
                onSave={() => {}}
                onRequestDeploy={handleRequestDeploy}
                onOpenTests={() => {}}
                language="clarity"
                filePath="contract.clar"
                showHeader={true}
                lastCompilation={lastValidation as any}
              />
            </div>
          )}

          {hasABI && (
            <div style={{ width: getMainPanelWidth() }} className="h-full overflow-hidden p-2">
              <ABIView
                projectId={project.id}
                userId={user?.id}
                refreshTrigger={refreshABITrigger}
                onRequestDeploy={handleRequestDeploy}
              />
            </div>
          )}

          {hasAI && (
            <div style={{ width: getMainPanelWidth() }} className="h-full overflow-hidden p-2">
              <AIChat />
            </div>
          )}
        </div>
      </div>

      {/* Deploy Dialog */}
      <DeployDialog
        open={showDeployDialog}
        onOpenChange={setShowDeployDialog}
        projectId={project.id}
        code={code}
        initialContractName={contractName}
        onDeploySuccess={() => setRefreshABITrigger((prev) => prev + 1)}
      />
    </div>
  );
}
