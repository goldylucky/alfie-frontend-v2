import React, { useEffect } from "react";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Wrapper } from "../../layouts/Wrapper";
import Image from "next/image";

const Success = () => {
  // run once
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <Wrapper>
      <div className="flex flex-col items-center my-10">
        <Image
          src={require("/assets/logo.png")}
          alt="Alfie"
          width={144}
          height={60}
        />
      </div>
      <div className="flex flex-col px-8 sm:px-14 pt-12 pb-10 bg-white rounded-md space-y-5 min-w-full md:min-w-0 md:max-w-md">
        <div className="flex flex-col items-center">
          <FontAwesomeIcon
            icon={faCircleCheck}
            className="text-indigo-800 h-28"
          />
          <p className="mb-2 font-md font-mulish font-bold text-lg text-center mt-4 text-indigo-800">
            Thank you for signing up to Alfie! We look forward to guiding you
            through your weight loss journey.
          </p>
        </div>
        <div className="flex flex-col text-center border-t border-gray-200">
          <p className="font-mulish text-md text-gray-900 pt-6">
            Please check your email to complete your signup. If you don&apos;t
            see an email from us in your inbox, please check your spam folder.
          </p>
          <p className="font-mulish text-md text-gray-900 pt-6">
            If you have any questions, please reach out to us at{" "}
            <a
              href="mailto:support@joinalfie.com"
              className="font-mulish text-indigo-800 hover:text-indigo-600"
            >
              support@joinalfie.com
            </a>
            .
          </p>
        </div>
        <div className="pb-3 flex flex-col items-center">
          <div className="pt-3">
            <a
              href="https://joinalfie.com"
              className="font-mulish text-sm text-indigo-800 hover:text-indigo-600"
            >
              Return to joinalfie.com
            </a>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Success;