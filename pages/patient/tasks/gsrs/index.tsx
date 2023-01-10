import { gql, useMutation } from "@apollo/client";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/solid";
import { FormikProvider } from "formik";
import { useFormikWizard, WizardProps } from "formik-wizard-form";
import { useNavigate } from "react-router";
import { BackButton } from "../../../../src/components/BackButton";
import { Button } from "../../../../src/components/Button";
import { useNotificationDispatch } from "../../../../context/NotificationContext";
import { convertFormValuesIntoAnswers } from "../../helpers";
import * as Steps from "./Steps";
const TOTAL_STEPS = Steps.list.length - 1;

const completeUserTaskMutation = gql`
  mutation CompleteTask($input: CompleteUserTaskInput!) {
    completeUserTask(input: $input) {
      completed
    }
  }
`;
export const Gsrs = ({ userTaskId = "" }) => {
  const notificationDispatchers = useNotificationDispatch();
  const navigate = useNavigate();
  const clearLocalStorage = () => {
    localStorage.removeItem("painOrDiscomfort");
    localStorage.removeItem("heartburn");
    localStorage.removeItem("acidReflux");
    localStorage.removeItem("hungerPains");
    localStorage.removeItem("nausea");
    localStorage.removeItem("bloated");
    localStorage.removeItem("burping");
    localStorage.removeItem("constipation");
    localStorage.removeItem("diarrhea");
    localStorage.removeItem("looseStools");
    localStorage.removeItem("gas");
    localStorage.removeItem("hardStools");
    localStorage.removeItem("urgentBowel");
    localStorage.removeItem("completeBowels");
  };
  const onCompleted = () => {
    clearLocalStorage();
    notificationDispatchers.displayNotification(
      "Your answers have been submitted",
      "Your results have been saved",
      "success"
    );
    navigate("/dashboard?refetch=true");
  };

  const [completeUserTask, { loading }] = useMutation(completeUserTaskMutation);

  const wizardConfig: WizardProps = {
    initialValues: Steps.initialValues,
    validateOnNext: true,
    validateOnChange: false,
    activeStepIndex: Number(localStorage.gsrsStep) || 0, // TODO
    steps: Steps.list,
    onSubmit: async () => null,
  };

  const gsrsForm = useFormikWizard(wizardConfig);

  const {
    handlePrev,
    handleNext,
    isPrevDisabled,
    isNextDisabled,
    renderComponent,
    currentStepIndex,
    isLastStep,
    values,
  } = gsrsForm;
  const onSubmit = async () => {
    const answers = convertFormValuesIntoAnswers(values);
    const input = { _id: userTaskId, answers };
    console.log("log: values", {
      input,
      values,
      convertedValues: convertFormValuesIntoAnswers(values),
    });

    await completeUserTask({ variables: { input } });
    onCompleted();
  };
  return (
    <>
      <BackButton location="dashboard" />
      <FormikProvider value={gsrsForm}>
        <div className="mt-20 flex flex-col px-8 sm:px-14 pt-10 pb-10 bg-white rounded-md space-y-5 md:w-2/3">
          <h1 className="text-xl md:text-2xl font-bold font-mulish text-center mb-5">
            Gastrointestinal Symptoms Rating Scale
          </h1>

          <div className="flex flex-col">
            <span className="text-base font-mulish font-light font-sm text-gray-400">
              Step {currentStepIndex + 1} of {TOTAL_STEPS + 1}
            </span>
          </div>
          <div className="flex flex-col">{renderComponent()}</div>
          <div className="pt-5 md:pt-10 pb-3 flex flex-row justify-between">
            <Button
              title="Back"
              onPress={handlePrev}
              disabled={isPrevDisabled}
              buttonLeft={<ArrowLeftIcon className="w-4 h-4 mr-3" />}
            />
            <Button
              title={isLastStep ? "Submit" : "Next"}
              onPress={isLastStep ? onSubmit : handleNext}
              disabled={loading || isNextDisabled}
              loading={loading}
              spinnerMl={3}
              spinnerSize={16}
              buttonRight={<ArrowRightIcon className="w-4 h-4 ml-3" />}
            />
          </div>
        </div>
      </FormikProvider>
    </>
  );
};
