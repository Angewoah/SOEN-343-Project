import { useState } from "react";

function Input({ attribute, className, id, reference, value }) {
  const [input, setInput] = useState(value);
  
  return <input 
    defaultValue={value} 
    className={"hover:underline border-2 rounded-lg px-2 border-white hover:border-neutral-300 transition-colors bg-neutral-100 w-full " + className} 
    id={String(attribute)+id}
    onChange={(v) => {
      reference[attribute] = v.target.value;
      setInput(v);
    }}
  />
}

function Field({ attribute, children, id, reference, value }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] text-md items-center gap-3">
      <label htmlFor={String(attribute)+id} className="whitespace-nowrap block font-medium text-gray-700">
        {attribute?.slice(0,1).toUpperCase() 
          + attribute?.slice(1).toLowerCase()}:
      </label>
      <Input attribute={attribute} id={id} reference={reference} value={value}/>
      {children}
    </div>
  );
}

export function ResourceCard(props) {
  const { resource, onUpdate, onDelete } = props;
  if (!resource || onUpdate == null || onDelete == null) {
    return null;
  }
  
  const { name, amount, status, id } = resource;
  
  return (
    <div className="flex flex-col bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
      <div 
        className="w-full"
        onBlur={() => {
          // Only update if there actually is a change.
          if (resource.name !== name 
              || resource.amount !== amount
              || resource.status !== status) {
            onUpdate(resource);
          }
        }}
      >
        <div className="mb-4">
          <Input 
            attribute="name"
            className="text-lg font-semibold py-1" 
            id={id} 
            reference={resource}
            value={name} 
          />
        </div>
        
        <div className="space-y-3 mb-4">
          <Field 
            attribute="amount"
            id={id} 
            reference={resource}
            value={amount}
          />
          <Field 
            attribute="status" 
            id={id}
            reference={resource}
            value={status}
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <button
          type="button"
          className="font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition-colors"
          onClick={() => {
            onDelete(resource.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}