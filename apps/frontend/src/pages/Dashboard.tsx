import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  CircleDot,
  CheckCircle2,
} from "lucide-react";
import { getProjects } from "../api/projects";
import { getTasks } from "../api/tasks";
import { getUsers } from "../api/users";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import type { Task } from "../types";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="card p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      {task.status === "DONE" ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      ) : task.status === "IN_PROGRESS" ? (
        <CircleDot className="w-4 h-4 text-blue-500 flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
        {task.project && (
          <p className="text-xs text-gray-400 truncate">{task.project.title}</p>
        )}
      </div>
      <StatusBadge status={task.status} />
    </div>
  );
}

export default function Dashboard() {
  const {
    data: projects = [],
    isLoading: loadingProjects,
    isError: errorProjects,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const {
    data: tasks = [],
    isLoading: loadingTasks,
    isError: errorTasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });

  const {
    data: users = [],
    isLoading: loadingUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const isLoading = loadingProjects || loadingTasks || loadingUsers;
  const isError = errorProjects || errorTasks;

  const todo = tasks.filter((t) => t.status === "TODO").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const completionRate =
    tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  // API already returns tasks sorted by createdAt desc
  const recentTasks = tasks.slice(0, 6);
  const recentProjects = projects.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-500">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Good overview of your workspace — ${projects.length} project${projects.length !== 1 ? "s" : ""}, ${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Projects"
          value={projects.length}
          icon={FolderKanban}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          label="Total Tasks"
          value={tasks.length}
          icon={CheckSquare}
          color="bg-amber-50 text-amber-600"
          sub={`${todo} to do · ${inProgress} in progress`}
        />
        <StatCard
          label="Completed"
          value={done}
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-600"
          sub={`${completionRate}% completion rate`}
        />
        <StatCard
          label="Team Members"
          value={users.length}
          icon={Users}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Task status breakdown */}
      {tasks.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Task Progress</h2>
          <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-gray-100">
            {todo > 0 && (
              <div
                className="bg-gray-300 transition-all"
                style={{ width: `${(todo / tasks.length) * 100}%` }}
              />
            )}
            {inProgress > 0 && (
              <div
                className="bg-blue-400 transition-all"
                style={{ width: `${(inProgress / tasks.length) * 100}%` }}
              />
            )}
            {done > 0 && (
              <div
                className="bg-emerald-400 transition-all"
                style={{ width: `${(done / tasks.length) * 100}%` }}
              />
            )}
          </div>
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
              To Do ({todo})
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
              In Progress ({inProgress})
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Done ({done})
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Recent Tasks
            </h2>
            <Link
              to="/projects"
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No tasks yet</p>
          ) : (
            <div>
              {recentTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Recent projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-gray-400" />
              Recent Projects
            </h2>
            <Link
              to="/projects"
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => {
                const projectTasks = tasks.filter(
                  (t) => t.projectId === project.id
                );
                const projectDone = projectTasks.filter(
                  (t) => t.status === "DONE"
                ).length;
                const progress =
                  projectTasks.length > 0
                    ? Math.round((projectDone / projectTasks.length) * 100)
                    : 0;
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                        {project.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {projectTasks.length} task{projectTasks.length !== 1 ? "s" : ""}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
