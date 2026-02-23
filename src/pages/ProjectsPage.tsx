import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2Icon, Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Project, DeploymentWithProject } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/App';
import { UserNav } from '@/components/UserNav';
import { ProjectList } from '@/components/projects/ProjectList';
import { DeploymentList } from '@/components/projects/DeploymentList';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { ProjectTabs, SortOption, NetworkFilter, WalletFilter } from '@/components/projects/ProjectTabs';
import { ProjectEditDialog } from '@/components/projects/ProjectEditDialog';
import { ProjectDeleteDialog } from '@/components/projects/ProjectDeleteDialog';
import { NewProjectDialog, CombinedTemplate } from '@/components/projects/NewProjectDialog';
import { SEO } from '@/components/seo/SEO';
import { ThemeToggle } from '@/components/ThemeToggle';

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

const HELLO_WORLD_CODE = `;; Hello World Contract
(define-data-var greeting (string-ascii 64) "Hello, World!")

(define-public (say-hello)
  (ok (var-get greeting)))

(define-public (set-greeting (new-greeting (string-ascii 64)))
  (begin
    (var-set greeting new-greeting)
    (ok (var-get greeting))))

(define-read-only (get-greeting)
  (ok (var-get greeting)))`;

const STARTER_PROJECTS = [
  {
    name: 'Counter',
    description: 'A simple counter contract — increment, decrement, and read state.',
    code: CLARITY_DEFAULT_CODE,
  },
  {
    name: 'Hello World',
    description: 'Get and set a greeting message on the Stacks blockchain.',
    code: HELLO_WORLD_CODE,
  },
];

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<DeploymentWithProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption['value']>('updated_desc');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [activeSection, setActiveSection] = useState<'projects' | 'deployments'>('projects');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDeployments, setIsLoadingDeployments] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>('all');
  const [walletFilter, setWalletFilter] = useState<WalletFilter>('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();


  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchDeployments();
    } else {
      setProjects([]);
      setDeployments([]);
      setIsLoading(false);
    }
  }, [sortBy, user]);

  // Fetch deployments when filters change
  useEffect(() => {
    if (user && activeSection === 'deployments') {
      fetchDeployments();
    }
  }, [networkFilter, walletFilter]);

  const fetchProjects = async () => {
    if (!user) {
      console.log('ProjectsPage: No user in context');
      setProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Only fetch projects owned by the current user
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          deployments:deployments(count)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Transform the data to include deployment count
      const projectsWithCounts = (data || []).map(project => ({
        ...project,
        deployment_count: project.deployments?.[0]?.count || 0
      }));

      // Apply sorting
      const sortedProjects = projectsWithCounts.sort((a, b) => {
        switch (sortBy) {
          case 'created_desc':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'created_asc':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'updated_desc':
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          case 'updated_asc':
            return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });

      // Seed starter projects for brand-new users
      if (sortedProjects.length === 0) {
        await seedStarterProjects(user.id);
        return; // seedStarterProjects calls fetchProjects again
      }

      setProjects(sortedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const seedStarterProjects = async (userId: string) => {
    try {
      const inserts = STARTER_PROJECTS.map(p => ({
        user_id: userId,
        name: p.name,
        description: p.description,
        code: p.code,
      }));

      const { error } = await supabase.from('projects').insert(inserts);
      if (error) throw error;
    } catch (error) {
      console.error('Error seeding starter projects:', error);
    } finally {
      // Refresh regardless
      await fetchProjects();
    }
  };

  const fetchDeployments = async () => {
    if (!user) {
      setDeployments([]);
      return;
    }

    try {
      setIsLoadingDeployments(true);

      // Fetch deployments with project info
      // First get all project IDs for this user
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id);

      const projectIds = userProjects?.map(p => p.id) || [];

      if (projectIds.length === 0) {
        setDeployments([]);
        setIsLoadingDeployments(false);
        return;
      }

      // Fetch deployments for user's projects
      let query = supabase
        .from('deployments')
        .select(`
          *,
          project:projects(id, name)
        `)
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Apply filters
      let filtered = data || [];

      // Network filter
      if (networkFilter !== 'all') {
        filtered = filtered.filter(d => {
          const network = d.metadata?.network || 'testnet';
          return network === networkFilter;
        });
      }

      // Wallet filter
      if (walletFilter !== 'all') {
        filtered = filtered.filter(d => {
          const walletType = d.metadata?.wallet_type;
          let effectiveType: string;
          if (walletType === 'external') {
            effectiveType = 'external';
          } else if (walletType === 'playground') {
            effectiveType = 'playground';
          } else {
            effectiveType = 'playground';
          }
          return effectiveType === walletFilter;
        });
      }

      // Apply sorting
      const sorted = filtered.sort((a, b) => {
        switch (sortBy) {
          case 'created_desc':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'created_asc':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'name_asc':
            return (a.project?.name || '').localeCompare(b.project?.name || '');
          case 'name_desc':
            return (b.project?.name || '').localeCompare(a.project?.name || '');
          case 'network_asc':
            return (a.metadata?.network || 'testnet').localeCompare(b.metadata?.network || 'testnet');
          case 'network_desc':
            return (b.metadata?.network || 'testnet').localeCompare(a.metadata?.network || 'testnet');
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });

      setDeployments(sorted);
    } catch (error) {
      console.error('Error fetching deployments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deployments',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDeployments(false);
    }
  };

  const handleCreateProject = async (data: {
    name: string;
    description: string;
    template?: CombinedTemplate;
    officialTemplateId?: string;
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create projects",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use template code or default Clarity code
      const projectCode = data.template?.code || CLARITY_DEFAULT_CODE;

      // Create project record
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description || '',
          code: projectCode,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      // Refresh projects list
      await fetchProjects();

      // Navigate to the new project
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== project.id));
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setProjectToDelete(null);
    }
  };

  const handleUpdateProject = async () => {
    if (!projectToEdit) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editName,
          description: editDescription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectToEdit.id);

      if (error) throw error;

      setProjects(projects.map(p =>
        p.id === projectToEdit.id
          ? { ...p, name: editName, description: editDescription }
          : p
      ));

      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setProjectToEdit(null);
    }
  };

  const sections = [
    {
      id: 'projects' as const,
      label: 'Projects',
      icon: Code2Icon,
      count: projects.length,
    },
    {
      id: 'deployments' as const,
      label: 'Deployments',
      icon: Rocket,
      count: deployments.length,
    },
  ];

  const getActiveContent = () => {
    switch (activeSection) {
      case 'projects':
        return (
          <ProjectList
            projects={projects}
            searchQuery={searchQuery}
            onNavigate={(id) => navigate(`/projects/${id}`)}
            onEdit={(project) => {
              setProjectToEdit(project);
              setEditName(project.name);
              setEditDescription(project.description || '');
            }}
            onDelete={setProjectToDelete}
            onExport={() => {}}
            isLoading={isLoading}
          />
        );
      case 'deployments':
        return (
          <DeploymentList
            deployments={deployments}
            searchQuery={searchQuery}
            isLoading={isLoadingDeployments}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <SEO
        title="Projects"
        description="Manage your Clarity smart contract projects"
        type="app"
      />

      {/* Fixed Header */}
      <header className="flex-none h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950">
                <Sparkles className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Clarity Studio</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Button variant="ghost" className="bg-muted gap-2">
                <Code2Icon className="h-4 w-4" />
                Projects
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 container mx-auto">
        <div className="h-full flex flex-col py-8">
          {/* Fixed Project Header */}
          <div className="flex-none mb-8">
            <ProjectHeader
              onNewProject={() => setShowNewProjectDialog(true)}
            />
          </div>

          {/* Fixed Tabs */}
          <div className="flex-none mb-6">
            <ProjectTabs
              sections={sections}
              activeSection={activeSection}
              searchQuery={searchQuery}
              sortBy={sortBy}
              onSectionChange={setActiveSection}
              onSearchChange={setSearchQuery}
              onSortChange={setSortBy}
              networkFilter={networkFilter}
              walletFilter={walletFilter}
              onNetworkFilterChange={setNetworkFilter}
              onWalletFilterChange={setWalletFilter}
            />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {getActiveContent()}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <NewProjectDialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
        onCreateProject={handleCreateProject}
      />

      <ProjectDeleteDialog
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
      />

      <ProjectEditDialog
        project={projectToEdit}
        name={editName}
        description={editDescription}
        onNameChange={setEditName}
        onDescriptionChange={setEditDescription}
        onClose={() => setProjectToEdit(null)}
        onConfirm={handleUpdateProject}
      />
    </div>
  );
}
