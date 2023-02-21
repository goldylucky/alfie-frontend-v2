import * as RadixDialog from "@radix-ui/react-dialog";
import { TextField } from "@src/components/ui/TextField";
import { TaskType } from "@src/graphql/generated";
import { useTaskCompletion } from "@src/hooks/useTaskCompletion";
import { useForm } from "react-hook-form";
import { Button } from "../../ui/Button";
import { DialogLongBody, DialogLongHeader } from "../Dialog";

export function FoodLog() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      breakfast: "",
      lunch: "",
      dinner: "",
    },
  });

  const [mutate] = useTaskCompletion();

  function onSubmit(data: any) {
    mutate({
      variables: {
        input: {
          taskName: TaskType.FoodLog,
          data: {
            breakfast: data.breakfast,
            lunch: data.lunch,
            dinner: data.dinner,
          },
        },
      },
    });
  }

  return (
    <div className="w-full max-w-[560px] whitespace-line md:min-w-[560px]">
      <DialogLongHeader title={"Food Log"} step={1} total={1} />
      <DialogLongBody>
        <div className="flex flex-col gap-y-2 w-full">
          <p className="font-bold text-sm mb-2">What did you eat today?</p>
          <div className="flex flex-col gap-3 justify-between items-center">
            <TextField
              placeholder="Breakfast"
              fullWidth
              inputSize="medium"
              {...register("breakfast")}
            />
            <TextField
              placeholder="Lunch"
              fullWidth
              inputSize="medium"
              {...register("lunch")}
            />
            <TextField
              placeholder="Dinner"
              fullWidth
              inputSize="medium"
              {...register("dinner")}
            />
          </div>
        </div>
      </DialogLongBody>
      <div className="w-full flex justify-end items-center relative px-6 pt-6 gap-x-3 flex-col md:flex-row gap-y-6">
        <RadixDialog.Close asChild>
          <Button size="medium" buttonType="secondary">
            Cancel
          </Button>
        </RadixDialog.Close>
        <Button size="medium" onClick={handleSubmit(onSubmit)}>
          Complete
        </Button>
      </div>
    </div>
  );
}
