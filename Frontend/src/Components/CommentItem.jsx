// import { Trash2, User } from "lucide-react";

// export default function CommentItem({
//     comment,
//     user,
//     confirmDelete,
//     onReply
// }) {
//     return (
//         <div className="mt-6">

//             {/* Comment */}
//             <div className="flex gap-3">
//                 <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
//                     <User className="w-4 h-4" />
//                 </div>

//                 <div className="flex-1">

//                     <div className="flex justify-between">
//                         <h4 className="text-xs font-bold">{comment.user}</h4>
//                         <span className="text-[10px] text-slate-400">
//                             {new Date(comment.created_at).toLocaleDateString()}
//                         </span>
//                     </div>

//                     <p className="text-sm bg-slate-50 p-3 rounded-xl border">
//                         {comment.content}
//                     </p>

//                     <div className="flex gap-3 mt-2">
//                         <button
//                             onClick={() => onReply(comment)}
//                             className="text-[10px] text-blue-600 font-bold uppercase"
//                         >
//                             Reply
//                         </button>

//                         {(user?.username === comment.user || user?.role === "ADMIN") && (
//                             <button
//                                 onClick={() => confirmDelete(comment.id)}
//                                 className="text-[10px] text-slate-400 flex items-center gap-1"
//                             >
//                                 <Trash2 className="w-3 h-3" /> Delete
//                             </button>
//                         )}
//                     </div>

//                     {/* RECURSIVE PART */}
//                     {comment.replies?.length > 0 && (
//                         <div className="ml-6 border-l border-slate-200 pl-4">
//                             {comment.replies.map((reply) => (
//                                 <CommentItem
//                                     key={reply.id}
//                                     comment={reply}
//                                     user={user}
//                                     confirmDelete={confirmDelete}
//                                     onReply={onReply}
//                                 />
//                             ))}
//                         </div>
//                     )}

//                 </div>
//             </div>

//         </div>
//     );
// }