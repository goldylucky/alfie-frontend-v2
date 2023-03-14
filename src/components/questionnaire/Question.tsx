import React, { useEffect } from "react";
import { Control, useController, useForm } from "react-hook-form";
import { Button } from "../ui/Button";
import { create, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { QuestionContainer } from "./QuestionContainer";
import { Checkbox } from "../ui/Checkbox";
import { ChevronLeftIcon, DocumentIcon } from "@heroicons/react/outline";
import {
  QuestionnaireLayout,
  useProgressContext,
} from "../layouts/QuestionaireLayout";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { TaskType } from "@src/graphql/generated";
import { createAnswersFromObject } from "@src/hooks/useTaskCompletion";
import { QuestionProps } from "./common";
import { medicalQuestions } from "./medicalQuestions";
import { threeFactorQuestions } from "./threeFactorQuestions";
import { metabolicQuestions } from "./metabolicQuestions";
import { gastroQuestions } from "./gastroQuestions";

interface FormState {
  formState: Record<string, any>;
  setFormState: (form: Record<string, any>) => void;
}

function createPersistedFormState(formName: string) {
  return create<FormState, [["zustand/persist", FormState]]>(
    persist(
      (set) => ({
        formState: {},
        setFormState: (formState: any) =>
          set((state: any) => ({
            ...state,
            formState: { ...state.formState, ...formState },
          })),
      }),
      {
        name: formName,
      }
    )
  );
}

/**
 * There is task, User task and etc. None of it makes sense as to which this fetchs from.
 * The other userTask will fail for me.
 * This succeeds with null data. Idk what that means.
 */
const userTaskQuery = gql`
  query UserTaskQuery($taskId: String!) {
    userTask(id: $taskId) {
      _id
      task {
        _id
        name
        type
      }
    }
  }
`;

/**
 * Goal is to in the future only provide questions and type then the form works out of the box.
 * Will need individual custom final submits
 * Still requires final result mapping to API call
 *
 */
export function Question() {
  const { taskId } = useRouter().query as { taskId: string };
  const { data, loading } = useQuery(userTaskQuery, {
    variables: {
      taskId,
    },
  });

  //TODO: Specific loading pages or?
  if (loading)
    return (
      <QuestionnaireLayout title="Loading...">
        <div />
      </QuestionnaireLayout>
    );

  if (data?.userTask?.task?.type === TaskType.NewPatientIntakeForm) {
    return (
      <QuestionnaireLayout title="Medical Questionnaire">
        <div className="relative flex flex-col gap-y-3 items-center w-full">
          <Questionnaire
            taskId={taskId}
            allQuestions={medicalQuestions}
            formName="medical"
          />
        </div>
      </QuestionnaireLayout>
    );
  }

  if (data?.userTask?.task?.type === TaskType.MpFeeling) {
    return (
      <QuestionnaireLayout title="Metabolic Profile (Feeling) Questionnaire">
        <div className="relative flex flex-col gap-y-3 items-center w-full">
          <Questionnaire
            taskId={taskId}
            allQuestions={metabolicQuestions}
            formName="metabolic"
          />
        </div>
      </QuestionnaireLayout>
    );
  }

  if (data?.userTask?.task?.type === TaskType.Gsrs) {
    return (
      <QuestionnaireLayout title="Gastrointestinal Symptoms Rating Scale">
        <div className="relative flex flex-col gap-y-3 items-center w-full">
          <Questionnaire
            taskId={taskId}
            allQuestions={gastroQuestions}
            formName="gsrs"
          />
        </div>
      </QuestionnaireLayout>
    );
  }

  if (data?.userTask?.task?.type === TaskType.Tefq) {
    return (
      <QuestionnaireLayout title="The Three-Factor Eating Questionnaire">
        <div className="relative flex flex-col gap-y-3 items-center w-full">
          <Questionnaire
            taskId={taskId}
            allQuestions={threeFactorQuestions}
            formName="tefq"
          />
        </div>
      </QuestionnaireLayout>
    );
  }

  return (
    <div className="relative flex flex-col gap-y-3 items-center w-full">
      <p className="text-white"></p>
    </div>
  );
}

function Questionnaire({
  allQuestions,
  formName,
  taskId,
}: {
  allQuestions: QuestionProps<any>[];
  formName: string;
  taskId: string;
}) {
  const router = useRouter();
  const store = useProgressContext();
  const { setMax, current, setCurrent } = useStore(store, (state: any) => ({
    setMax: state.setMax,
    setCurrent: state.setCurrent,
    current: state.current,
  }));

  useEffect(() => {
    setMax(allQuestions.length);
  }, [allQuestions, setMax, setCurrent]);

  const boundForm = createPersistedFormState(formName);
  const onSubmit = boundForm((state: any) => ({
    setFormState: state.setFormState,
  }));

  const { handleSubmit, control, trigger, register, reset } = useForm({
    defaultValues: getStoredForm(formName),
    reValidateMode: "onBlur",
  });

  useEffect(() => {
    reset(getStoredForm(formName));
  }, [taskId]);

  const question = allQuestions?.[current];
  const Component = question?.Component;
  const endQuestion = current + 1 === allQuestions?.length;

  /**
   * All Final Task should be submitted here.
   * Keys based of passed array ID field
   * Value is determined via field Input type
   *
   * @param data
   *
   */
  function onSubmitForm(data: Record<string, any>) {
    const answers = createAnswersFromObject(data);
    const input = {
      _id: taskId,
      answers,
    };

    console.log("Presubmission", input);

    // Clear Stored Form
    boundForm.persist.clearStorage();
  }

  return (
    <QuestionContainer helper={question?.helperText}>
      <div className="flex items-center justify-center">
        {current > 0 && !endQuestion && (
          <button
            className="p-1 border rounded-md border-gray-400 w-[40px] h-[40px] flex items-center justify-center"
            onClick={() =>
              router.push(
                `/questionnaire/${router?.query?.taskId}?step=${current - 1}`
              )
            }
          >
            <ChevronLeftIcon className="stroke-gray-400 w-8 h-8" />
          </button>
        )}
      </div>
      <div className="flex-grow max-w-[500px] mx-auto w-full">
        <div className="flex flex-col items-center w-full gap-y-3">
          {!!Component && (
            <Component
              control={control}
              key={question?.id}
              name={question.id}
              register={register}
              question={question.question}
              validation={question.validation}
            />
          )}
          <div className="pt-3" />
          <Button
            size="large"
            onClick={async () => {
              if (!question?.id) return;
              /**
               * Trigger validation step by step within form
               *
               */
              if (!endQuestion) {
                try {
                  const valid = await trigger(question?.id);
                  if (!!valid) {
                    handleSubmit((value) => {
                      onSubmit.setFormState(value);
                      router.push(
                        `/questionnaire/${router?.query?.taskId}?step=${
                          current + 1
                        }`
                      );
                    })();
                  }
                } catch (error) {
                  /**
                   * This should never happen
                   */
                  console.log("Zod", { error });
                }
              } else {
                handleSubmit(onSubmitForm)();
              }
            }}
          >
            Submit
          </Button>
        </div>
      </div>
      <div className="flex-1">
        {current > 0 && !endQuestion && (
          <button
            className="p-1 border rounded-md border-gray-400 w-[40px] h-[40px] flex items-center justify-center invisible"
            onClick={() => setCurrent(current - 1)}
          >
            <ChevronLeftIcon className="stroke-gray-400 w-8 h-8" />
          </button>
        )}
      </div>
    </QuestionContainer>
  );
}

function getStoredForm(formName: string) {
  const storage = localStorage.getItem(formName);
  try {
    const parsed = JSON.parse(storage || "{}");
    return parsed?.state?.formState || {};
  } catch (error) {
    return {};
  }
}

const requiredDocNames = [
  "TSH",
  "Hb1Ac",
  "Lipid Panel",
  "Comprehensive Metabolic Panel",
];

/**
 *  !New Patient Intake Form
 * 
 *  localStorage.removeItem("weightManagementMethods")
    localStorage.removeItem("conditions")
    localStorage.removeItem("previousConditions")
    localStorage.removeItem("medications")
    localStorage.removeItem("hasSurgicalHistory")
    localStorage.removeItem("allergies")
    localStorage.removeItem("usePillPack")
    localStorage.removeItem("pharmacy")
    localStorage.removeItem("pharmacyLocation")
 */

/**
   * !Metabolic Feeling
   *  localStorage.removeItem("tenseLevel")
      localStorage.removeItem("frightenedLevel")
      localStorage.removeItem("easeFrequency")
      localStorage.removeItem("worryAmount")
      localStorage.removeItem("frightenedFrequency")
      localStorage.removeItem("restlessAmount")
      localStorage.removeItem("panicFrequency")
   * 
   */

/**
 * !Gastro
 *  localStorage.removeItem("painOrDiscomfort")
    localStorage.removeItem("heartburn")
    localStorage.removeItem("acidReflux")
    localStorage.removeItem("hungerPains")
    localStorage.removeItem("nausea")
    localStorage.removeItem("bloated")
    localStorage.removeItem("burping")
    localStorage.removeItem("constipation")
    localStorage.removeItem("diarrhea")
    localStorage.removeItem("looseStools")
    localStorage.removeItem("gas")
    localStorage.removeItem("hardStools")
    localStorage.removeItem("urgentBowel")
    localStorage.removeItem("completeBowels")
 * 
 */

/**
 *  !Ad Limitum
 * 
 *  localStorage.removeItem("systolic")
    localStorage.removeItem("diastolic")
 * 
 * 
 */

/**
 *  !Three Factor Questionnaire
 * 
 *  localStorage.removeItem("alwaysEating")
    localStorage.removeItem("smallHelpings")
    localStorage.removeItem("anxiousEating")
    localStorage.removeItem("uncomfortableEating")
    localStorage.removeItem("eatingWithOthers")
    localStorage.removeItem("overeatingWhenBlue")
    localStorage.removeItem("delicacyEating")
    localStorage.removeItem("bottomlessPit")
    localStorage.removeItem("alwaysHungry")
    localStorage.removeItem("lonelyEating")
    localStorage.removeItem("holdBack")
    localStorage.removeItem("fatFoods")
    localStorage.removeItem("alwaysHungry2")
    localStorage.removeItem("howOftenHungry")
    localStorage.removeItem("avoidStockingUp")
    localStorage.removeItem("conciouslyEatLess")
    localStorage.removeItem("eatingBinges")
    localStorage.removeItem("restraint")
 * 
 * 
 */
