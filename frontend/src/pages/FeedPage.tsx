// import { useFeedPosts } from "../services/posts";
// import PostCard from "../components/PostCard";
// import CreatePostModal from "../components/CreatePostModal";

// const FeedPage = () => {
//   const {
//     isLoading,
//     data,
//     error,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     status,
//   } = useFeedPosts();

//   return (
//     <div className="container mx-auto p-4">
//       <CreatePostModal />

//       {isLoading ? (
//         <p>Loading...</p>
//       ) : status === "error" ? (
//         <p>Error: {error.message}</p>
//       ) : (
//         <>
//           {data.pages.map((group, i) => (
//             <div key={i}>
//               {group.posts.map((post) => (
//                 <PostCard key={post._id} post={post} />
//               ))}
//             </div>
//           ))}
//           <div>
//             <button
//               onClick={() => fetchNextPage()}
//               disabled={!hasNextPage || isFetchingNextPage}
//             >
//               {isFetchingNextPage
//                 ? "Loading more..."
//                 : hasNextPage
//                 ? "Load More"
//                 : "Nothing more to load"}
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default FeedPage;
