import { gql, useLazyQuery, useQuery } from "@apollo/client";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PaperClipIcon,
} from "@heroicons/react/solid";
import * as Sentry from "@sentry/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { UnControlledTextInput } from "../../inputs/UnControlledTextInput";
import { PractitionerApplicationLayout } from "../../components/layouts/PractitionerApplicationLayout";
import { SkeletonLoader } from "../loading/PatientSkeletonLoader";

import { Patient, PatientWeights } from "../../components/practitioner/Table";
import { SlideOver } from "../../SlideOver";
import { PatientTasks } from "../practitioner/PatientTasks";

const getAllProviderPatientsQuery = gql`
  query getAllPatientsByProvider {
    getAllPatientsByHealthCoach {
      _id
      name
      gender
      phone
      email
      dateOfBirth
      heightInInches
      meetingRoomUrl
      address {
        line1
        line2
        city
        state
        postalCode
      }
      weights {
        date
        value
      }
    }
  }
`;

const getTasksQuery = gql`
  query getTasksByPatient($userId: String!) {
    getAllUserTasksByUser(userId: $userId) {
      _id
      task {
        name
      }
      dueAt
      completed
      answers {
        key
        value
      }
      pastDue
      lastNotifiedUserAt
      createdAt
      completedAt
    }
  }
`;
export const HealthCoachPatients = () => {
  const patients = useQuery(getAllProviderPatientsQuery);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskView, setTaskViewOpen] = useState<boolean>(false);
  const [showPatientDetails, setShowPatientDetails] = useState<boolean>(false);
  const [showPatientTasks, setShowPatientTasks] = useState<boolean>(false);
  const [showPatientMedical, setShowPatientMedical] = useState<boolean>(false);
  const findPatientInPatients = patients.data?.getAllPatientsByHealthCoach.find(
    (patient: Patient) => patient._id === searchParams.get("id")
  );
  console.log("findPatientInPatients", findPatientInPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(
    null || patients.data?.getAllPatientsByHealthCoach[0]
  );
  const [patientFilterValue, setPatientFilterValue] = useState<string>("");
  useEffect(() => {
    if (selectedPatient?._id) {
      const allPatients = patients.data?.getAllPatientsByHealthCoach.find(
        (patient: Patient) => patient._id === String(selectedPatient?._id)
      );
      setSelectedPatient(allPatients);
    } else {
      // Just set the first patient in the list to the selected patient
      setSelectedPatient(findPatientInPatients);
    }
  }, [
    selectedPatient?._id,
    patients.data?.getAllPatientsByHealthCoach,
    findPatientInPatients,
  ]);

  // use lazy query to make the call in a useEffect
  const [getTasks, { data, loading }] = useLazyQuery(getTasksQuery);
  useEffect(() => {
    if (selectedPatient?._id) {
      getTasks({ variables: { userId: String(selectedPatient?._id) } });
    }
  }, [selectedPatient?._id, getTasks]);

  useEffect(() => {
    // If there is an error with the query, we want to log it to Sentry
    if (patients.error) {
      Sentry.captureException(new Error(patients.error.message), {
        tags: {
          query: "getAllPatientsByProvider",
          component: "Patients",
        },
      });
    }
  }, [patients]);

  // filters by first and last name ignoring spaces
  const filterPatients = patients.data?.getAllPatientsByHealthCoach?.filter(
    (patient: Patient) => {
      // Sorry about the split here and in the build directory
      // db needs to separate first and last name
      const name = patient?.name.split(" ");
      const firstName = name[0];
      const lastName = name[1];

      return !patientFilterValue
        ? true
        : (firstName?.toLowerCase() + lastName?.toLowerCase()).includes(
            patientFilterValue?.toLowerCase().replace(/\s/g, "")
          );
    }
  );
  // memoize the filtered patients so we don't have to filter on every render
  const filteredPatients = useMemo(() => filterPatients, [filterPatients]);

  type Directory = {
    [key: string]: { id: string; name: string }[];
  };
  const buildDirectory = (): Directory => {
    const directory: any = [];

    filteredPatients?.forEach((patient: Patient) => {
      // capitalize first letter of name
      const name = patient.name.split(" ");
      const firstLetter: string = name[0][0].toUpperCase();
      const patientObj = {
        id: patient._id,
        name: patient.name,
      };

      if (directory[firstLetter]) {
        directory[firstLetter].push(patientObj);
      } else {
        directory[firstLetter] = [patientObj];
      }
    });
    // put directory in alphabetical order
    const sortedDirectory = Object.keys(directory)
      .sort()
      .reduce((obj: any, key: any) => {
        obj[key] = directory[key];
        return obj;
      }, {});
    return sortedDirectory;
  };

  const directory = buildDirectory();

  const selectedPatientWeight = selectedPatient?.weights.map(
    (weight: PatientWeights) => {
      const today = new Date();
      const weightDate = new Date(weight.date);
      if (today > weightDate) {
        return weight;
      } else {
        return null;
      }
    }
  ) as PatientWeights[];
  function selectATask(task: any) {
    setTaskViewOpen(true);
    setSelectedTask(task);
  }
  const medicalQuestionnaire = data?.getAllUserTasksByUser.find(
    (task: any) => task.task.name === "Medical Questionnaire"
  );
  const medicalQuestionnaireAnswers = medicalQuestionnaire?.answers;
  function questionnaireNames(name: string) {
    switch (name) {
      case "weightLossAttemptTime":
        return "Weight Loss Attempt";
      case "weightManagementMethods":
        return "Weight Management Methods";
      case "conditions":
        return "Conditions";
      case "medications":
        return "Medications";
      case "previousConditions":
        return "Previous Conditions";
      case "hasSurgicalHistory":
        return "Surgical History";
      case "usePillPack":
        return "Pill Pack";
      case "hasRequiredLabs":
        return "Has Labs";
      case "pharmacyLocation":
        return "Pharmacy Location";
      case "labCorpLocation":
        return "LabCorp Location";
      default:
        return name;
    }
  }
  const answers = medicalQuestionnaireAnswers?.map((answer: any) => {
    return {
      key: questionnaireNames(answer.key),
      value: answer.value,
    };
  });
  const allTasks = data?.getAllUserTasksByUser;
  const waistTasks = allTasks?.filter(
    (task: any) => task.task.name === "Waist Measurement" && task.task.completed
  );
  const weightTasks = allTasks?.filter(
    (task: any) => task.task.name === "Enter your Weight" && task.task.completed
  );
  const stepTasks = allTasks?.filter(
    (task: any) =>
      task.task.name === "Metabolic Profile: Activity" && task.task.completed
  );
  const bloodPressureTask = allTasks?.filter(
    (task: any) =>
      task.task.name === "Log your Blood Pressure" && task.task.completed
  );
  const weightData = weightTasks?.map((task: any) => {
    return {
      date: new Date(task.completedAt).toLocaleDateString(),
      value: task?.answers[0]?.value,
    };
  });
  const waistData = waistTasks?.map((task: any) => {
    return {
      date: new Date(task.completedAt).toLocaleDateString(),
      value: task?.answers[0]?.value,
    };
  });
  const stepData = stepTasks?.map((task: any) => {
    return {
      date: new Date(task.completedAt).toLocaleDateString(),
      value: task?.answers[0]?.value,
    };
  });
  const bloodPressureData = bloodPressureTask?.map((task: any) => {
    return {
      date: new Date(task.completedAt).toLocaleDateString(),
      value: task?.answers[0]?.value,
    };
  });
  return (
    <PractitionerApplicationLayout title="Patients">
      <SlideOver
        selectedTask={selectedTask}
        title={selectedTask?.task.name}
        isOpen={taskView}
        setIsOpen={() => setTaskViewOpen(!taskView)}
      />
      <div className="flex flex-row h-[84vh]">
        <div className="flex flex-col w-1/4 overflow-y-auto">
          <nav
            className="flex flex-col overflow-y-auto h-[84vh] w-full bg-white shadow-md rounded-md px-4"
            aria-label="Directory"
          >
            {/* 
                I want to have a header named Directory
                then a sub header describing to search directory of 21 patients
                then a search bar below that 
              */}
            <div className="flex flex-col bg-white sticky z-40 top-0 py-4">
              <h1 className="text-2xl font-bold">Directory</h1>
              <h2 className="text-sm text-gray-500">
                <b>{filteredPatients?.length}</b> Patients
              </h2>
              <div className="flex flex-row justify-between items-center">
                <UnControlledTextInput
                  name="search"
                  placeholder="Search"
                  value={patientFilterValue}
                  handleChange={(e: any) => {
                    setPatientFilterValue(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="relative">
              {Object.keys(directory).map((letter) => (
                <div key={letter}>
                  {patients.loading && <div>Loading...</div>}
                  {!patients.loading && (
                    <div className="sticky top-32 z-20 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                      <h3>{letter}</h3>
                    </div>
                  )}
                  <ul
                    role="list"
                    className="relative z-0 divide-y divide-gray-200"
                  >
                    {directory[letter].map((person: any) => (
                      <li
                        key={person.id}
                        className={
                          person.id === selectedPatient?._id
                            ? "bg-gray-200"
                            : "bg-white"
                        }
                        onClick={() => {
                          setSelectedPatient(
                            patients.data?.getAllPatientsByHealthCoach.find(
                              (patient: Patient) => patient._id === person.id
                            )
                          );
                        }}
                      >
                        <div className="relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ringroyalBlue hover:bg-gray-50">
                          <div className="min-w-0 flex-1">
                            <div className="focus:outline-none cursor-pointer">
                              {/* Extend touch target to entire panel */}
                              <span
                                className="absolute inset-0"
                                aria-hidden="true"
                              />
                              <p className="text-sm font-medium text-gray-900">
                                {person.name}
                              </p>
                              <p className="truncate text-sm text-gray-500">
                                {person.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>
        <div className="flex flex-col w-3/4 pl-8 overflow-y-auto">
          {patients?.loading && <SkeletonLoader />}
          {/* <ResponsiveContainer width="100%" height="100%"> */}

          {/* </ResponsiveContainer> */}
          <div className="bg-white shadow sm:rounded-lg mb-10">
            <div
              onClick={() => {
                setShowPatientDetails(!showPatientDetails);
              }}
              className="flex flex-row items-center justify-between cursor-pointer"
            >
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {selectedPatient?.name}'s Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Patient details
                </p>
              </div>
              <div className="pr-4 cursor-pointer">
                {showPatientDetails === true ? (
                  <ChevronUpIcon className="w-8 h-8 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-8 h-8 text-gray-500" />
                )}
              </div>
            </div>

            {showPatientDetails === true && !patients?.loading && (
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Full name
                    </dt>

                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {selectedPatient?.name}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Date of birth
                    </dt>

                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {/* format the date to make it readable */}
                      {new Date(
                        selectedPatient?.dateOfBirth
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Email address
                    </dt>

                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {selectedPatient?.email}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Phone Number
                    </dt>

                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {selectedPatient?.phone}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Address
                    </dt>

                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {/* Create address from line1, line2, city, state, postalCode */}
                      {selectedPatient?.address?.line1},{" "}
                      {selectedPatient?.address?.line2}{" "}
                      {selectedPatient?.address?.city},{" "}
                      {selectedPatient?.address?.state}{" "}
                      {selectedPatient?.address?.postalCode}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Height in inches
                    </dt>

                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {selectedPatient?.heightInInches}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Weight
                    </dt>

                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {selectedPatientWeight?.[0].value} lbs as of{" "}
                      {/* Format the date to readable */}
                      {new Date(
                        selectedPatientWeight?.[0].date
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Attachments
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      <ul
                        role="list"
                        className="divide-y divide-gray-200 rounded-md border border-gray-200"
                      >
                        <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                          <div className="flex w-0 flex-1 items-center">
                            <PaperClipIcon
                              className="h-5 w-5 flex-shrink-0 text-gray-400"
                              aria-hidden="true"
                            />
                            <span className="ml-2 w-0 flex-1 truncate">
                              ID_Card.pdf
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <p className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                              View
                            </p>
                          </div>
                        </li>
                        <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                          <div className="flex w-0 flex-1 items-center">
                            <PaperClipIcon
                              className="h-5 w-5 flex-shrink-0 text-gray-400"
                              aria-hidden="true"
                            />
                            <span className="ml-2 w-0 flex-1 truncate">
                              Insurance_Card.pdf
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <p className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                              View
                            </p>
                          </div>
                        </li>
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-col bg-white shadow rounded-lg overflow-hidden">
              <div
                onClick={() => {
                  setShowPatientTasks(!showPatientTasks);
                }}
                className="flex flex-row items-center justify-between cursor-pointer"
              >
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Patient's Tasks
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    All patient tasks are listed here.
                  </p>
                </div>
                <div
                  onClick={() => {
                    setShowPatientTasks(!showPatientTasks);
                  }}
                  className="pr-4 cursor-pointer"
                >
                  {showPatientTasks === true ? (
                    <ChevronUpIcon className="w-8 h-8 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-8 h-8 text-gray-500" />
                  )}
                </div>
              </div>
              {showPatientTasks === true && (
                <PatientTasks
                  data={data}
                  loading={loading}
                  selectATask={selectATask}
                />
              )}
            </div>
            {/* <div>
              <h1 className="text-lg font-medium leading-6 text-gray-900 pb-8">
                Statuses
              </h1>
              <div className="py-6 px-4 flex flex-col bg-white shadow rounded-lg overflow-hidden">
                <Timeline />
              </div>
            </div> */}
          </div>
          <div className="pt-10">
            <div className="flex flex-col bg-white shadow rounded-lg overflow-hidden">
              <div
                onClick={() => {
                  setShowPatientMedical(!showPatientMedical);
                }}
                className="flex flex-row items-center justify-between cursor-pointer"
              >
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Medical Questionnaire
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Patients medical questionnaire results is listed here.
                  </p>
                </div>
                <div
                  onClick={() => {
                    setShowPatientMedical(!showPatientMedical);
                  }}
                  className="pr-4 cursor-pointer"
                >
                  {showPatientMedical === true ? (
                    <ChevronUpIcon className="w-8 h-8 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-8 h-8 text-gray-500" />
                  )}
                </div>
              </div>
              {showPatientMedical === true && (
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    {answers?.map((answer: any) => (
                      <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          {answer.key}
                        </dt>

                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                          {answer.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
            {/* <div>
              <h1 className="text-lg font-medium leading-6 text-gray-900 pb-8">
                Statuses
              </h1>
              <div className="py-6 px-4 flex flex-col bg-white shadow rounded-lg overflow-hidden">
                <Timeline />
              </div>
            </div> */}
          </div>
          <div className="pt-10">
            {/* <ProTable score={selectedPatient?.score} /> */}
          </div>
          <div>
            <div className="flex flex-row pb-10 flex-wrap justify-around pt-10">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 pb-2">
                  Weight
                </h3>
                <div className="px-4 py-4 flex flex-col bg-white shadow rounded-lg">
                  <LineChart
                    width={500}
                    height={300}
                    data={weightData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 pb-2">
                  Waist
                </h3>
                <div className="px-4 py-4 flex flex-col bg-white shadow rounded-lg">
                  <LineChart
                    width={500}
                    height={300}
                    data={waistData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 pb-2">
                  Steps
                </h3>
                <div className="px-4 py-4 flex flex-col bg-white shadow rounded-lg">
                  <LineChart
                    width={500}
                    height={300}
                    data={stepData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 pb-2">
                  Blood Pressure
                </h3>
                <div className="px-4 py-4 flex flex-col bg-white shadow rounded-lg">
                  <LineChart
                    width={500}
                    height={300}
                    data={bloodPressureData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PractitionerApplicationLayout>
  );
};