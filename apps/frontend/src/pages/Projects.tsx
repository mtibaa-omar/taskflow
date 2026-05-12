import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Plus,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  CheckSquare,
  Calendar,
} from "lucide-react";
import { getProjects, createProject, updateProject, deleteProject } from "../api/projects";
import { getUsers } from "../api/users";
import { getTasks } from "../api/tasks";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import type { Project, CreateProjectPayload } from "../types";

function ProjectForm({
  initial,
  users,
  onSubmit,
  loading,
}: {
  initial?: Project;
  users: { id: number; name: string }[];
  onSubmit: (data: CreateProjectPayload) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [ownerId, setOwnerId] = useState<number>(
    initial?.ownerId ?? (users[0]?.id ?? 0)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim() || undefined, ownerId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <input
          className="input"
          placeholder="e.g. Website Redesign"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="What is this project about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {!initial && (
        <div>
          <label className="label">Owner *</label>
          {users.length === 0 ? (
            <p className="text-sm text-amber-600">
              No users found. Create a user first.
            </p>
          ) : (
            <select
              className="input"
              value={ownerId}
              onChange={(e) => setOwnerId(Number(e.target.value))}
              required
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      <div className="flex gap-3 pt-2 justify-end">
        <button type="submit" className="btn-primary" disabled={loading || (!initial && users.length === 0)}>
          {loading ? "Saving…" : initial ? "Save Changes" : "Create Project"}
        </button>
      </div>
    </form>
  );
}

function ProjectCard({
  project,
  taskCount,
  doneCount,
  onEdit,
  onDelete,
}: {
  project: Project;
  taskCount: number;
  doneCount: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;
  const createdAt = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <FolderKanban className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate leading-tight">
              {project.title}
            </h3>
            {project.owner && (
              <p className="text-xs text-gray-400 mt-0.5">{project.owner.name}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 w-36 animate-fade-in"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => { setMenuOpen(false); onEdit(); }}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={() => { setMenuOpen(false); onDelete(); }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
      )}

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" />
            {doneCount}/{taskCount} tasks
          </span>
          <span className="text-xs font-medium text-gray-600">{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {createdAt}
        </span>
        <Link
          to={`/projects/${project.id}`}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
        >
          Open board <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function Projects() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created!");
      setCreateOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { title?: string; description?: string } }) =>
      updateProject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated!");
      setEditProject(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Project deleted");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
        action={
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> New Project
          </button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks and tracking progress."
          action={
            <button className="btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> New Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === "DONE");
            return (
              <ProjectCard
                key={project.id}
                project={project}
                taskCount={projectTasks.length}
                doneCount={doneTasks.length}
                onEdit={() => setEditProject(project)}
                onDelete={() => setDeleteId(project.id)}
              />
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Project">
        <ProjectForm
          users={users}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editProject}
        onClose={() => setEditProject(null)}
        title="Edit Project"
      >
        {editProject && (
          <ProjectForm
            initial={editProject}
            users={users}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editProject.id, data })
            }
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        title="Delete Project"
        message="This will permanently delete the project and all its tasks. This action cannot be undone."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
