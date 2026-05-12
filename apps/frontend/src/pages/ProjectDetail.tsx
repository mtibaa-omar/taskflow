import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  CircleDot,
  Circle,
  MoreHorizontal,
  Calendar,
  FolderKanban,
} from "lucide-react";
import { getProject } from "../api/projects";
import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../api/tasks";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import type { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from "../types";

const COLUMNS: { status: TaskStatus; label: string; icon: React.ElementType; color: string }[] = [
  {
    status: "TODO",
    label: "To Do",
    icon: Circle,
    color: "text-gray-400",
  },
  {
    status: "IN_PROGRESS",
    label: "In Progress",
    icon: CircleDot,
    color: "text-blue-500",
  },
  {
    status: "DONE",
    label: "Done",
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
];

function TaskForm({
  initial,
  projectId,
  onSubmit,
  loading,
}: {
  initial?: Task;
  projectId: number;
  onSubmit: (data: CreateTaskPayload | UpdateTaskPayload) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "TODO");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      ...(!initial && { projectId }),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <input
          className="input"
          placeholder="What needs to be done?"
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
          placeholder="Add more details…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Status</label>
        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : initial ? "Save Changes" : "Create Task"}
        </button>
      </div>
    </form>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const createdAt = new Date(task.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const nextStatus: Record<TaskStatus, TaskStatus | null> = {
    TODO: "IN_PROGRESS",
    IN_PROGRESS: "DONE",
    DONE: null,
  };

  const next = nextStatus[task.status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-800 leading-snug flex-1">
          {task.title}
        </p>
        <div className="relative flex-shrink-0">
          <button
            className="p-1 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-7 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 w-36 animate-fade-in"
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

      {task.description && (
        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {createdAt}
        </span>
        {next && (
          <button
            className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            onClick={() => onStatusChange(next)}
          >
            → Move to {next === "IN_PROGRESS" ? "In Progress" : "Done"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("TODO");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: !isNaN(projectId),
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks", { projectId }],
    queryFn: () => getTasks({ projectId }),
    enabled: !isNaN(projectId),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", { projectId }] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created!");
      setCreateOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: UpdateTaskPayload }) =>
      updateTask(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", { projectId }] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated!");
      setEditTask(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", { projectId }] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", { projectId }] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
      setDeleteTaskId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loadingProject || loadingTasks) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Project not found.</p>
        <Link to="/projects" className="btn-primary mt-4 inline-flex">
          Back to Projects
        </Link>
      </div>
    );
  }

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
              )}
              {project.owner && (
                <p className="text-xs text-gray-400 mt-1">
                  Owner: {project.owner.name}
                </p>
              )}
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setCreateStatus("TODO");
              setCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {/* Stats strip */}
        <div className="flex gap-6 mt-5">
          {COLUMNS.map(({ status, label, icon: Icon, color }) => {
            const count = tasksByStatus(status).length;
            return (
              <div key={status} className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-medium text-gray-700">{count}</span>
                <span className="text-sm text-gray-400">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban board */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No tasks yet"
          description="Add your first task to start tracking work on this project."
          action={
            <button
              className="btn-primary"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map(({ status, label, icon: Icon, color }) => {
            const columnTasks = tasksByStatus(status);
            return (
              <div key={status} className="flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center gap-2 px-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                  <span className="ml-auto text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Add to this column */}
                <button
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors flex items-center justify-center gap-1.5"
                  onClick={() => {
                    setCreateStatus(status);
                    setCreateOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add task
                </button>

                {/* Task cards */}
                <div className="flex flex-col gap-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => setEditTask(task)}
                      onDelete={() => setDeleteTaskId(task.id)}
                      onStatusChange={(s) =>
                        statusMutation.mutate({ taskId: task.id, status: s })
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create task modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Task"
      >
        <TaskForm
          projectId={projectId}
          onSubmit={(data) =>
            createMutation.mutate({ ...(data as CreateTaskPayload), status: createStatus, projectId })
          }
          loading={createMutation.isPending}
          initial={{ status: createStatus } as Task}
        />
      </Modal>

      {/* Edit task modal */}
      <Modal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        title="Edit Task"
      >
        {editTask && (
          <TaskForm
            initial={editTask}
            projectId={projectId}
            onSubmit={(data) =>
              updateMutation.mutate({ taskId: editTask.id, data })
            }
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTaskId !== null}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={() => deleteTaskId !== null && deleteMutation.mutate(deleteTaskId)}
        title="Delete Task"
        message="This task will be permanently deleted and cannot be recovered."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
