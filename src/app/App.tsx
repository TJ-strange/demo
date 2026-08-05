import { Redirect, Route, Switch } from "wouter";
import { WorkspacePage } from "../features/workspace/WorkspacePage";

export function App() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/tasks/task-streaming" />} />
      <Route path="/tasks/:taskId" component={WorkspacePage} />
      <Route component={() => <Redirect to="/tasks/task-streaming" />} />
    </Switch>
  );
}
