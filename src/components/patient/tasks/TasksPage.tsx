import React from "react";
import { gql, useQuery } from "@apollo/client";
import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { UserTask } from "../../../graphql/generated";
import { TaskItem } from "./TaskItem";
import { LoadingTaskItem } from "./LoadingTaskItems";
import { ToggleGroup } from "@src/components/ui/ToggleGroup";

const userTasksQuery = gql`
  query UserTasksQuery($limit: Float, $offset: Float, $completed: Boolean) {
    userTasks(
      input: { limit: $limit, offset: $offset, completed: $completed }
    ) {
      total
      userTasks {
        _id
        task {
          _id
          name
          type
          highPriority
        }
        dueAt
        pastDue
        createdAt
      }
    }
  }
`;

export const TasksPage = () => {
  const [taskFilter, setTaskFilter] = React.useState<"Active" | "Completed">(
    "Active"
  );

  const { data, error, loading } = useQuery(userTasksQuery, {
    variables: {
      limit: 100,
      completed: taskFilter === "Completed",
    },
  });

  console.log({ data });

  useEffect(() => {
    // If there is an error with the query, we want to log it to Sentry
    if (error) {
      Sentry.captureException(new Error(error.message), {
        tags: {
          query: "userTasksQuery",
          component: "Tasks",
        },
      });
    }
  }, [error]);

  const toggleItems = [
    {
      content: (
        <div>
          Active Tasks <span className="">12</span>
        </div>
      ),
      value: "active",
    },
    {
      content: (
        <div>
          Completed Tasks <span className="">4</span>
        </div>
      ),
      value: "completed",
    },
  ];

  console.log({
    tasks: data?.userTasks?.userTasks,
  });
  return (
    <div>
      {error && <div>{error.message}</div>}
      {!error && (
        <div className="flex flex-col bg-white p-6 rounded-lg">
          <div className="flex flex-row pb-8">
            <ToggleGroup defaultValue="active" items={toggleItems} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-mulish">
            {taskFilter} tasks
          </h2>
          {data?.userTasks?.userTasks.map((userTask: UserTask, i: number) => (
            <div className="pt-6" key={i}>
              <TaskItem
                key={userTask._id}
                id={userTask._id}
                type={userTask?.task?.type || ""}
                title={userTask?.task?.name || ""}
                createdAt={userTask.createdAt}
                dueAt={userTask.dueAt}
                pastDue={userTask.pastDue}
                actionText="Complete"
              />
            </div>
          ))}
          {loading &&
            Array(6)
              .fill("")
              .map((_, i) => (
                <div className="pt-6">
                  <LoadingTaskItem key={i} />
                </div>
              ))}

          {/* <div className="mt-2 md:mt-4 flex flex-col md:flex-row items-center justify-center md:justify-end">
            <span className="text-gray-700 text-sm mb-1 md:text-md font-mulish font-medium md:hidden">
              1 of {data?.userTasks?.total || 1}
            </span>
          </div> */}
        </div>
      )}
    </div>
  );
};
