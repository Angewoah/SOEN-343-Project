import { Link, useLocation } from '@tanstack/react-router';
import { XMarkIcon } from "@heroicons/react/24/solid";

export function DatumMenu({ page, children, title }) {
  const { pathname } = useLocation();
  const dirArr = pathname.split('/')
  const hasId = !isNaN(parseFloat(dirArr[dirArr.length-1]));
  return <div className="w-full flex flex-col items-center">
    <div className="h-20 w-full flex bg-white items-center rounded-t-4xl border-b-1 border-b-neutral-200">
      <Link
        to={page && dirArr.slice(0,dirArr.length-1-hasId).join('/') + "/" + page}
        className="px-4 cursor-pointer border-r-1 border-r-neutral-900"
      >
        <XMarkIcon className="w-6 h-6" />
      </Link>
      <h1 className="text-lg font-mono ml-4">{title}</h1>
    </div>
    <div className="w-full flex flex-col px-72 py-4">
      { children }
    </div>
  </div>
}