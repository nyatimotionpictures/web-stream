import { useQuery } from "@tanstack/react-query";
import {  getAllFilms,  getFilmContent, getUserPurchaseList, getUserWatchList } from "./api";

export function useGetAllFilms() {
    return useQuery({
        queryKey: ["films"],
        queryFn: getAllFilms,
       
    });
}

export function useGetFilm(id: String) {
    return useQuery({
        queryKey: ["film", id],
        queryFn: () => getFilmContent(id),
       
    });
}

export function useGetWatchList(id: String) {
    return useQuery({
        queryKey: ["watchlist", id],
        queryFn: () => getUserWatchList(id),
    })
}

export function useGetPurchaseList(id: String) {
    return useQuery({
        queryKey: ["purchaselist", id],
        queryFn: () => getUserPurchaseList(id)
    })
}