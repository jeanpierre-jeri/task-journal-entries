import { useState } from "react";
import type { CreateTaskInput } from "../../../store/api/tasksApi";
import { type Task, TaskType } from "../../../types";
import type { FormEvent } from "react";
import type { Key } from "react-aria-components";
import { Button, Label, Select, SelectItem, TextField } from "../../../components/ui";
import { TASK_TYPE_LABELS } from "../constants";



interface CreateTaskPanelProps {
  onSubmit: (input: CreateTaskInput) => Promise<Task>;
  onSuccess: (task: Task) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface CreateTaskFormErrors {
  title?: string;
  type?: string;
}



export function CreateTaskPanel({
  onSubmit,
  onSuccess,
  onCancel,
  isSubmitting,
}: CreateTaskPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [errors, setErrors] = useState<CreateTaskFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTaskType(null);
    setErrors({});
    setSubmitError(null);
  };

  const handleTypeChange = (key: Key | null) => {
    if (key == null) {
      setTaskType(null);
      return;
    }
    setTaskType(key as TaskType);
    setErrors((prev) => ({ ...prev, type: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    const nextErrors: CreateTaskFormErrors = {};
    if (!trimmedTitle) {
      nextErrors.title = "Title is required";
    }
    if (!taskType) {
      nextErrors.type = "Type is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    if (!taskType) {
      return;
    }

    const payload: CreateTaskInput = {
      title: trimmedTitle,
      description: trimmedDescription ? trimmedDescription : undefined,
      type: taskType,
    };

    try {
      const createdTask = await onSubmit(payload);
      resetForm();
      onSuccess(createdTask);
    } catch (error) {
      const fallbackMessage = "Failed to create task. Please try again.";
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: unknown }).data === "string"
      ) {
        setSubmitError((error as { data: string }).data);
      } else if (error instanceof Error && error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError(fallbackMessage);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <div className="p-4">
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <TextField
          label="Title"
          value={title}
          onChange={(value) => {
            setTitle(value);
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: undefined }));
            }
            setSubmitError(null);
          }}
          isInvalid={Boolean(errors.title)}
          errorMessage={errors.title}
          isRequired
        />

        <div className="flex flex-col gap-1">
          <Label htmlFor="create-task-description">Description</Label>
          <textarea
            id="create-task-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setSubmitError(null);
            }}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <span className="text-xs text-gray-500">
            Optional
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <Select
            label="Type"
            selectedKey={taskType ?? undefined}
            onSelectionChange={handleTypeChange}
          >
            {(Object.values(TaskType) as TaskType[]).map((option) => (
              <SelectItem key={option} id={option}>
                {TASK_TYPE_LABELS[option]}
              </SelectItem>
            ))}
          </Select>
          {errors.type ? (
            <span className="text-xs text-red-600">{errors.type}</span>
          ) : (
            <span className="text-xs text-gray-500">
              Choose the automation this task should run.
            </span>
          )}
        </div>

        {submitError && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onPress={handleCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isDisabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  );
}