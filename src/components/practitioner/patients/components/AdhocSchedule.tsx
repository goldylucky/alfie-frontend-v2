import { DialogModal } from "@src/components/modal/Dialog";
import { ScheduleAppointment } from "@src/components/modal/variants/schedule/Schedule";
import { Button } from "@src/components/ui/Button";
import { Patient } from "../../dashboard/Table";

export function AdhocSchedule({ patient }: { patient: Patient }) {
  return (
    <div className="w-full mt-6">
      <div className="flex justify-between">
        <h3 className="mb-6 text-xl font-bold">Schedule Appointment</h3>
        <DialogModal triggerAsChild trigger={
          <Button
            onClick={() => { }}
          >
            Schedule
          </Button>
        }>
          <ScheduleAppointment
            userId={patient?._id}
            notes="Scheduled by provider"
          />
        </DialogModal>
      </div>
      <div className="bg-white border rounded-xl p-6">
        <p className="text-gray-500">
          Click the {"\"Schedule\""} button to schedule an ad-hoc appointment with this patient.
        </p>
      </div>
    </div>
  );
}
