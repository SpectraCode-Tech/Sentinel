// import React from "react";
// import { Trash2, User } from "lucide-react";

// export default function ReplyItem({ reply, onReply, onDelete }) {

//     return (

//         <div className="flex gap-2">

//             <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
//                 <User size={12} />
//             </div>

//             <div className="flex-1">

//                 <div className="flex justify-between">
//                     <strong className="text-xs">{reply.user}</strong>
//                 </div>

//                 <p className="bg-white border p-2 rounded text-sm">
//                     {reply.content}
//                 </p>

//                 <div className="flex gap-3 mt-1 text-[10px]">

//                     <button
//                         onClick={() => onReply(reply)}
//                         className="text-blue-600"
//                     >
//                         Reply
//                     </button>

//                     <button
//                         onClick={() => onDelete(reply.id)}
//                         className="text-red-500 flex gap-1"
//                     >
//                         <Trash2 size={10} /> Delete
//                     </button>

//                 </div>

//             </div>

//         </div>

//     );
// }