import { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useParams } from "wouter";
import {
  currentTaskIdAtom,
  leftDrawerOpenAtom,
  rightDrawerOpenAtom,
  themeAtom,
} from "../../state/workspaceState";
import { TaskSidebar } from "./components/TaskSidebar";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { ConversationPanel } from "./components/ConversationPanel";
import { ContextPanel } from "./components/ContextPanel";
import { Composer } from "./components/Composer";
import { MobileDrawer } from "./components/MobileDrawer";

export function WorkspacePage() {
  const params = useParams<{ taskId?: string }>();
  const setTaskId = useSetAtom(currentTaskIdAtom);
  const [leftOpen, setLeftOpen] = useAtom(leftDrawerOpenAtom);
  const [rightOpen, setRightOpen] = useAtom(rightDrawerOpenAtom);
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    if (params.taskId) {
      setTaskId(params.taskId);
    }
  }, [params.taskId, setTaskId]);

  useEffect(() => {
    // 主题状态存在 Jotai 里，最终通过 html.dark 触发 Tailwind v4 的 dark variant。
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <main className="h-dvh overflow-hidden bg-zinc-50 text-zinc-950 transition-colors duration-300 dark:bg-[#18181B] dark:text-zinc-50">
      {/* grid 只有一行时也要显式写 minmax(0,1fr)，否则 PC 三栏下内容可能把行高撑开。 */}
      <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="hidden min-h-0 border-r border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-[#3F3F46] dark:bg-[#202024]/90 lg:block">
          <TaskSidebar />
        </aside>

        <section className="flex h-full min-h-0 flex-col overflow-hidden">
          <WorkspaceHeader onOpenTasks={() => setLeftOpen(true)} onOpenContext={() => setRightOpen(true)} />
          <ConversationPanel />
          <Composer />
        </section>

        <aside className="hidden min-h-0 border-l border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-[#3F3F46] dark:bg-[#202024]/90 lg:block">
          <ContextPanel />
        </aside>
      </div>

      <MobileDrawer side="left" open={leftOpen} onClose={() => setLeftOpen(false)}>
        <TaskSidebar onNavigate={() => setLeftOpen(false)} />
      </MobileDrawer>
      <MobileDrawer side="right" open={rightOpen} onClose={() => setRightOpen(false)}>
        <ContextPanel />
      </MobileDrawer>
    </main>
  );
}
