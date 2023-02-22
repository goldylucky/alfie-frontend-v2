import { Layout } from "@src/components/layouts/Layout";
import { PatientTasks } from "@src/components/practitioner/patients/PatientTasks";
import { AllPatientsTabs } from "@src/components/practitioner/patients/tabs";

function Patients() {
  return <AllPatientsTabs />;
}

Patients.isAuthRequired = true;
Patients.getLayout = (page: React.ReactNode) => (
  <Layout title="My Patients">{page}</Layout>
);

export default Patients;
