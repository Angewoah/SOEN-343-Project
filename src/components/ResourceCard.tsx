import { useState } from "react";

function Input({ attribute, className, id, reference, value }) {
  const [input, setInput] = useState(value);
  
  return <input 
    defaultValue={value} 
    className={"hover:underline border-2 rounded-lg px-2 border-white hover:border-neutral-300 transition-colors bg-neutral-100 " + className} 
    id={String(attribute)+id}
    onChange={(v) => {
      reference[attribute] = v.target.value;
      setInput(v);
    }}
  />
}

function Field({ attribute, children, id, reference, value }) {
  return (
    <div className="grid grid-cols-[auto_1fr] text-md ml-2 items-center gap-2">
      <label htmlFor={String(attribute)+id} className="whitespace-nowrap min-w-[6rem] block font-medium">
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
    return;
    
  }
  const { name, amount, status, id } = resource;
  return <div className="flex flex-row flex flex-col text-md border-neutral-300 border-2 p-2 my-4 rounded-lg overflow-hidden max-w-112 gap-4 justify-between items-end">
    <div 
      className=""
      onBlur={() => {
        
        // Only update if there actually is a change.
        if (resource.name!==name 
            || resource.amount!==amount
            || resource.status!==status) {
          onUpdate(resource);
          
        }
      }}
    >
      <Input 
        attribute="name"
        className="mb-4 font-semibold" 
        id={id} 
        reference={resource}
        value={name} 
      />
      <div className="flex flex-col justify-start">
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
    <button
      type="button"
      className="font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center cursor-pointer"
      onClick={() => {
        onDelete(resource.id);
      }}
    >
      Delete
    </button>
  </div>
}
