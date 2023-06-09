import { SelectInput } from "@src/components/inputs/SelectInput";
import { InsurancePlanTypes, InsurancePlans } from "@src/utils/insurance";
const InsuranceDetails = () => {
  return (
    <div>
      <h3 className="text-xl text-brand-berry font-bold mb-4 mx-4">
        Insurance Details
      </h3>
      <div className="flex flex-col gap-8 px-4">
        <div className="flex gap-16 w-full">
          <div className="flex flex-col w-64">
            <p className="text-primary-700 font-bold">
              Insurance Plan<span className="text-[red]">*</span>
            </p>
            <SelectInput
              name="insuranceType"
              placeholder="Select"
              options={InsurancePlans}
            />
          </div>
          <div className="flex flex-col w-64">
            <p className="text-primary-700 font-bold">
              Plan Type<span className="text-[red]">*</span>
            </p>
            <SelectInput
              name="insurancePlan"
              placeholder="Select"
              options={InsurancePlanTypes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default InsuranceDetails;
