import * as React from "react";

function Field({ label, children }) {
  return <div className="flex flex-row items-center text-md">
    <label>{label}: </label>
    <input placeholder="unspecified" className="hover:underline transition-colors">
      {children}
    </input>
  </div>
}

export function ResourceCard(props) {
  const { resourceData } = props;
  return <div className="flex items-center text-md border-neutral-300 rounded-lg">
    {resourceData ?
      resourceData.map((resource) => {
        <div className="flex flex-col justify-start">
          <Field label="">{resource.name}</Field>
          <Field label="Amount">{resource.amount}</Field>
          <Field label="Status">{resource.status}</Field>
        </div>
      }) : <span className="text-sm text-gray-600">(no resources exist for this event)</span>;
    }
  </div>
}