import { useMutation } from "@tanstack/react-query";

import { queryClient } from "../../../lib/tanstack.ts";
/** create film mutation */
// export function useCreateFilm() {
//   return useMutation({
//     mutationFn: (data: CreateNewFilmRequest) => postFilmContent(data),
//     onSettled: async (_, error) => {
//       if (error) {
//         console.log("error", error);
//       } else {
//         await queryClient.invalidateQueries({ queryKey: ["films"] });
//       }
//     },
//   });
// }

// /** update film mutation */
// export function useUpdateFilm() {
  
//   return useMutation({
//     mutationFn: (data: UpdateFilmRequest) => updateFilmContent(data),
//     onSettled: async (_, error) => {
//       if (error) {
//         console.log("error", error);
//       } else {
//         await queryClient.invalidateQueries({ queryKey: ["film"] });
//       }
//     },
//   });
// }

/** change password mutation */
// export function useChangePassword() {
 
//   return useMutation({
//     mutationFn: (data: any) => changePassword(data),
//     onSettled: async (_, error) => {
//       if (error) {
//       //  console.log("error", error);
//       } else {
//        // await queryClient.invalidateQueries({ queryKey: ["films"] });
//       }
//     },
//   });
// }

/** delete film mutation */
// export function useDeleteFilm() {
 
//   return useMutation({
//     mutationFn: (data: String) => deleteFilm(data),
//     onSuccess: (data, variables, context) => {
//       console.log("run first");
//     },
//     onError: () => {
//       console.log("run first");
//     },
//     onSettled: async (_, error) => {
//       if (error) {
//         console.log("error", error);
//       } else {
//         await queryClient.invalidateQueries({ queryKey: ["films"] });
//       }
//     },
//   });
// }



